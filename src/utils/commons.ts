export function last<T>(someList: T[]): T | undefined {
	return someList[someList.length - 1]
}

export function replace<T>(item: T, newItem: T) {
	return (current: T) => (current === item ? newItem : current)
}
