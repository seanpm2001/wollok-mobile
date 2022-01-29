import { RouteProp, useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { upperCaseFirst } from 'upper-case-first'
import { Expression, Send } from 'wollok-ts/dist/model'
import ExpressionInput from '../components/ui/ExpressionInput'
import { SubmitCheckButton } from '../components/ui/Header'
import { Row } from '../components/ui/Row'
import { wTranslate } from '../utils/translation-helpers'
import { EntityStackParamList } from './EntityStack'

export function NewMessageCall({
	route: {
		params: { method, receiver, contextFQN, onSubmit },
	},
}: {
	route: RouteProp<EntityStackParamList, 'NewMessageSend'>
}) {
	const [args, setArguments] = useState<(Expression | undefined)[]>(
		Array(method.parameters.length),
	)

	const navigation = useNavigation()

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<SubmitCheckButton
					disabled={args.some(a => a === undefined)}
					onSubmit={() =>
						onSubmit!(
							new Send({
								receiver,
								args: args as Expression[],
								message: method.name,
							}),
						)
					}
				/>
			),
		})
	}, [navigation, args, method, onSubmit, receiver])

	function setParameter(i: number, newParameter?: Expression) {
		const newParameters = [...args]
		newParameters[i] = newParameter
		setArguments(newParameters)
	}

	return (
		<View>
			{method.parameters.map((_, i) => (
				<Row key={i}>
					<Text>{_.name}</Text>
					<ExpressionInput
						fqn={contextFQN}
						setValue={expression => setParameter(i, expression)}
						value={args[i]}
						inputPlaceholder={upperCaseFirst(
							wTranslate('expression.enterValue'),
						)}
					/>
				</Row>
			))}
		</View>
	)
}
