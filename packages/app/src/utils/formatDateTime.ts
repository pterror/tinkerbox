import { regexEscape } from "@/utils/regex";

type Formatter = (dateTime: Date) => string;
const formatters: Record<string, Formatter> = {};

export function dateTimeFormatter(format: string) {
	const parts: Formatter[] = [];
	const formattersRegex = new RegExp(
		Object.keys(formatters)
			.sort((a, b) => a.length - b.length)
			.map(regexEscape)
			.join("|"),
		"g",
	);
	for (const [, prefix, format_ = ""] of format.matchAll(formattersRegex)) {
		prefix && parts.push(() => prefix);
		const formatter = formatters[format_];
		formatter && parts.push(formatter);
	}
	return (dateTime: Date) => parts.map((part) => part(dateTime)).join("");
}
