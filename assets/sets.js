function setDiff(a, b)
{
	return new Set([...a].filter(x => !b.has(x)));
}

