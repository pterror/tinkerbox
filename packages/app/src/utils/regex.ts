export function regexEscape(string: string) {
	return string.replace(/[\\^$.|?*+()[{]/g, "\\$&");
}
