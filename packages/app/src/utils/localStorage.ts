type Extractor<T> = (value: unknown) => readonly [T] | undefined;

export const newLocalStorage = <T extends object>(
	key: string,
	extractors: { [K in keyof T]: Extractor<T[K]> },
) => {
	const values: Partial<T> = {};
	try {
		const json = globalThis.localStorage.getItem(key);
		const value = json ? JSON.parse(json) : undefined;
		if (typeof value === "object") {
			for (const [key, validate] of Object.entries(extractors)) {
				if (key in value) {
					const extracted = (validate as Extractor<any>)(value[key]);
					if (extracted !== undefined) {
						values[key as keyof T] = extracted[0];
					}
				}
			}
		}
	} catch {}
	const save = () => {
		globalThis.localStorage.setItem(key, JSON.stringify(values));
	};
	return {
		get<K extends keyof T>(key: K) {
			return values[key];
		},
		set<K extends keyof T>(key: K, value: T[K]) {
			values[key] = value;
			save();
		},
		delete<K extends keyof T>(key: K) {
			delete values[key];
			save();
		},
	};
};
