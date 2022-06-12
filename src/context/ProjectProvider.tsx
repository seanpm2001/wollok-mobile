import React, { createContext, useState } from 'react'
import 'react-native-get-random-values'
import { DirectedInterpreter } from 'wollok-ts/dist/interpreter/interpreter'
import link from 'wollok-ts/dist/linker'
import {
	Describe,
	Entity,
	Environment,
	Import,
	Module,
	Name,
	Package,
	Problem,
	Reference,
	Test,
} from 'wollok-ts/dist/model'
import validate from 'wollok-ts/dist/validator'
import { saveProject } from '../services/persistance.service'
import { ParentComponentProp } from '../utils/type-helpers'
import {
	EntityMember,
	executionFor,
	interpretTest,
	TestRun,
} from '../utils/wollok-helpers'
import { createContextHook } from './create-context-hook'

export const mainPackageName = 'main'
export const testsPackageName = 'tests'

export const ProjectContext = createContext<{
	project: Environment
	name: string
	changed: boolean
	problems: Problem[]
	actions: Actions
} | null>(null)

type Actions = {
	setNewProject: (name: Name, project: Environment) => void
	rebuildEnvironment: (entity: Entity) => void
	addEntity: (module: Module) => void
	addDescribe: (test: Describe) => void
	addMember: (parent: Module) => (newMember: EntityMember) => void
	changeMember: (
		parent: Module,
	) => (oldMember: EntityMember, newMember: EntityMember) => void
	runTest: (test: Test) => TestRun
	newInterpreter: () => DirectedInterpreter
	save: () => Promise<unknown>
}

export function ProjectProvider(
	props: ParentComponentProp<{
		projectName: string
		initialProject: Environment
	}>,
) {
	const [name, setName] = useState(props.projectName)
	const [project, setProject] = useState<Environment>(
		link(props.initialProject.members),
	)
	const [changed, setChanged] = useState(false)
	const [problems, setProblems] = useState(
		validateProject(project) as Problem[],
	)

	/////////////////////////////////// BUILD //////////////////////////////////

	function buildEnvironment(
		name: Name,
		members: Entity[],
		base?: Environment,
	): Environment {
		const mainImport =
			name !== mainPackageName
				? [
						new Import({
							entity: new Reference({ name: mainPackageName }),
							isGeneric: true,
						}),
				  ]
				: undefined
		const pack = new Package({ name, members, imports: mainImport })
		return link([pack], base ?? project)
	}

	function rebuildEnvironment(entity: Entity) {
		const packageName = entity.is('Describe')
			? testsPackageName
			: mainPackageName
		const newProject = buildEnvironment(packageName, [entity])
		setProject(newProject)
		setChanged(true)
		setProblems(validateProject(newProject))
	}

	function validateProject(_project: Environment) {
		const targetPackages = [
			_project.getNodeByFQN(mainPackageName),
			_project.getNodeByFQN(testsPackageName),
		]
		const belongsToTargetProject = (p: Problem) =>
			targetPackages.some(target => p.node.ancestors().includes(target))

		return validate(_project).filter(belongsToTargetProject)
	}

	/////////////////////////////////// BUILD //////////////////////////////////

	/////////////////////////////////// ENTITIES //////////////////////////////////
	function setNewProject(newName: Name, _newProject: Environment) {
		const newProject = link(_newProject.members)
		setName(newName)
		setProject(newProject)
		setProblems(validateProject(newProject))
		setChanged(false)
	}

	function addEntity(newEntity: Module) {
		rebuildEnvironment(newEntity)
	}

	function addDescribe(newDescribe: Describe) {
		rebuildEnvironment(newDescribe)
	}

	const addMember = (entity: Module) => (newMember: EntityMember) => {
		rebuildEnvironment(
			entity.copy({
				members: [...entity.members, newMember],
			}) as Module,
		)
	}

	const changeMember =
		(entity: Module) => (oldMember: EntityMember, newMember: EntityMember) => {
			rebuildEnvironment(
				entity.copy({
					members: [...entity.members.filter(m => m !== oldMember), newMember],
				}) as Module,
			)
		}

	/////////////////////////////////// ENTITIES //////////////////////////////////

	/////////////////////////////////// EXECUTION //////////////////////////////////

	function newInterpreter() {
		return executionFor(project)
	}

	function runTest(test: Test) {
		return interpretTest(test, project)
	}

	/////////////////////////////////// EXECUTION //////////////////////////////////

	async function save() {
		await saveProject(props.projectName, project)
		setChanged(false)
	}

	const initialContext = {
		project,
		name,
		changed,
		problems,
		actions: {
			setNewProject,
			addEntity,
			addDescribe,
			addMember,
			changeMember,
			rebuildEnvironment,
			runTest,
			newInterpreter,
			save,
		},
	}
	return (
		<ProjectContext.Provider value={initialContext}>
			{props.children}
		</ProjectContext.Provider>
	)
}

export const useProject = createContextHook(ProjectContext, {
	hookName: 'useProject',
	contextName: 'ProjectProvider',
})
