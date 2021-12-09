import React, { createContext, useContext, useState } from 'react'
import { Expression, Segment } from '../models/expression'
import { OneOrMany } from '../utils/type-helpers'

export const ExpressionContext = createContext<{
	expression: Expression
	actions: Actions
} | null>(null)

type Actions = {
	addSegment: (segment: Segment) => void
}

export function ExpressionProvider(props: {
	children: OneOrMany<JSX.Element>
}) {
	const [expression, setExpression] = useState<Expression>(new Expression())
	const initialContext = {
		expression,
		actions: {
			addSegment: (segment: Segment) => {
				setExpression(expression.addSegment(segment))
			},
		},
	}
	return (
		<ExpressionContext.Provider value={initialContext}>
			{props.children}
		</ExpressionContext.Provider>
	)
}

export function useExpression() {
	const context = useContext(ExpressionContext)
	if (context === null) {
		throw new Error('useExpression must be used within a ExpressionProvider')
	}
	return context
}
