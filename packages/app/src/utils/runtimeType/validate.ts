import type { RuntimeType, RuntimeTypeRepr, RuntimeTypeReprs } from "@/utils/runtimeType";

// TODO: consider re-exporting via `assert.ts` and `extract.ts`
export type Extractor<T> = (value: unknown) => readonly [T] | undefined;
export type Validator<T> = (value: unknown) => value is T;
export type Assertor<T> = (value: unknown) => asserts value is T;

const registeredExtractors: {
	[K in keyof RuntimeTypeReprs]?: (
		repr: RuntimeTypeReprs[K]["repr"],
	) => Extractor<RuntimeTypeReprs[K]["type"]>;
} = {};

export const register = <K extends keyof RuntimeTypeReprs>(
	key: K,
	extractorFactory: (repr: RuntimeTypeReprs[K]["repr"]) => Extractor<RuntimeTypeReprs[K]["type"]>,
	warn = true,
) => {
	if (warn && key in registeredExtractors) {
		console.warn(`Extractor for type '${key}' is already defined.`);
	}
	registeredExtractors[key] = extractorFactory;
};

export const newExtractor = <T>(repr: RuntimeType<T>): Extractor<T> => {
	const type = (repr as RuntimeTypeRepr).type;
	const extractor = registeredExtractors[type]?.(repr as any);
	if (extractor === undefined) {
		throw new Error(`Extractor for type '${type}' was not found.`);
	}
	return extractor;
};

export const newValidator = <T>(repr: RuntimeType<T>): Validator<T> => {
	const extractor = newExtractor(repr);
	return (value): value is T => extractor(value) !== undefined;
};

export const newAssertor = <T>(repr: RuntimeType<T>): Assertor<T> => {
	const extractor = newExtractor(repr);
	return (value): asserts value is T => {
		if (extractor(value) === undefined) {
			throw new Error(`Assertion failed for type '${(repr as RuntimeTypeRepr).type}'.`);
		}
	};
};

export const registerAll = (warn = true) => {
	register("boolean", boolean, warn);
	register("number", number, warn);
	register("string", string, warn);
	register("symbol", symbol, warn);
	register("bigint", bigint, warn);
	register("Array", Array, warn);
	register("ReadonlyArray", ReadonlyArray, warn);
	register("Map", Map, warn);
	register("ReadonlyMap", ReadonlyMap, warn);
	register("Set", Set, warn);
	register("ReadonlySet", ReadonlySet, warn);
	register("Promise", Promise, warn);
};

const extractorFactory =
	<K extends keyof RuntimeTypeReprs>() =>
	<E extends (repr: RuntimeTypeReprs[K]["repr"]) => Extractor<RuntimeTypeReprs[K]["type"]>>(
		extractorFactory: E,
	) =>
		extractorFactory;

const booleanExtractor = (value: unknown) =>
	typeof value === "boolean" ? ([value] as const) : undefined;

export const boolean = extractorFactory<"boolean">()(() => booleanExtractor);

const numberExtractor = (value: unknown) =>
	typeof value === "number" ? ([value] as const) : undefined;

export const number = extractorFactory<"number">()(() => numberExtractor);

const stringExtractor = (value: unknown) =>
	typeof value === "string" ? ([value] as const) : undefined;

export const string = extractorFactory<"string">()(() => stringExtractor);

const symbolExtractor = (value: unknown) =>
	typeof value === "symbol" ? ([value] as const) : undefined;

export const symbol = extractorFactory<"symbol">()(() => symbolExtractor);

const bigintExtractor = (value: unknown) =>
	typeof value === "bigint" ? ([value] as const) : undefined;

export const bigint = extractorFactory<"bigint">()(() => bigintExtractor);

const ArrayInternal = extractorFactory<"Array" | "ReadonlyArray">()(<T>(
	repr: RuntimeTypeRepr<"Array" | "ReadonlyArray", T>,
) => {
	const itemValidator = newValidator(repr.item);
	return (value: unknown) =>
		globalThis.Array.isArray(value) && value.every(itemValidator) ? [value] : undefined;
});

export const Array: <T>(repr: {
	type: "Array";
	item: RuntimeType<T>;
}) => (value: unknown) => [T[]] | undefined = extractorFactory<"Array">()(ArrayInternal);

export const ReadonlyArray: <T>(repr: {
	type: "ReadonlyArray";
	item: RuntimeType<T>;
}) => (value: unknown) => readonly [T[]] | undefined =
	extractorFactory<"ReadonlyArray">()(ArrayInternal);

const MapInternal = extractorFactory<"Map" | "ReadonlyMap">()(<K, V>(
	repr: RuntimeTypeRepr<"Map" | "ReadonlyMap", [K, V]>,
) => {
	const keyValidator = newValidator(repr.key);
	const valueValidator = newValidator(repr.value);
	return (value: unknown) => {
		if (!(value instanceof globalThis.Map)) return;
		for (const [k, v] of value.entries()) {
			if (!keyValidator(k) || valueValidator(v)) return;
		}
		return [value as Map<K, V>];
	};
});

export const Map: <K, V>(repr: {
	type: "Map";
	key: RuntimeType<K>;
	value: RuntimeType<V>;
}) => (value: unknown) => [Map<K, V>] | undefined = extractorFactory<"Map">()(MapInternal);

export const ReadonlyMap: <K, V>(repr: {
	type: "ReadonlyMap";
	key: RuntimeType<K>;
	value: RuntimeType<V>;
}) => (value: unknown) => [ReadonlyMap<K, V>] | undefined =
	extractorFactory<"ReadonlyMap">()(MapInternal);

const SetInternal = extractorFactory<"Set" | "ReadonlySet">()(<T>(
	repr: RuntimeTypeRepr<"Set" | "ReadonlySet", T>,
) => {
	const itemValidator = newValidator(repr.item);
	return (value: unknown) => {
		if (!(value instanceof globalThis.Set)) return;
		for (const v of value.values()) {
			if (!itemValidator(v)) return;
		}
		return [value as Set<T>];
	};
});

export const Set: <T>(repr: {
	type: "Set";
	item: RuntimeType<T>;
}) => (value: unknown) => [Set<T>] | undefined = extractorFactory<"Set">()(SetInternal);

export const ReadonlySet: <T>(repr: {
	type: "ReadonlySet";
	item: RuntimeType<T>;
}) => (value: unknown) => [ReadonlySet<T>] | undefined =
	extractorFactory<"ReadonlySet">()(SetInternal);

const PromiseExtractor = (value: unknown) =>
	value instanceof globalThis.Promise ? ([value] as const) : undefined;

/** Unsafe! There is no way to get the internal value of a promise if it doesn't exist yet. */
export const Promise = extractorFactory<"Promise">()(() => PromiseExtractor);
