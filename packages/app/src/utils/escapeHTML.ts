export const escapeHTML = (text: string) => {
	const mapping: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		'"': "&quot;",
		"'": "&#39;",
		">": "&gt;",
	};
	return text.replace(/[&<>"']/g, (m) => mapping[m]);
};
