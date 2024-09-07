declare const type: unique symbol;

// FIXME:: integers, union, intersection, tuple, maybe discriminated union too
// TODO: pattern matching, stringifying type names, toJSON (cheat using JSON.stringify)
// toTOML, toYAML

export interface RuntimeType<T> {
	[type]?: T;
}

export interface BaseRepr<Type extends string> {
	type: Type;
}

/** Declaration merge into this interface (TODO: and register a const using =  `registerRuntimeType`) =>
 * to add a new `repr`. */
export interface RuntimeTypeReprs {}
export type RuntimeTypeRepr<Type extends string = string, T = any> = Extract<
	RuntimeTypeReprs<T>[keyof RuntimeTypeReprs]["repr"],
	BaseRepr<Type>
>;
type _Sanity<
	T extends {
		[K in keyof RuntimeTypeReprs]: { repr: { type: K }; type: unknown };
	} = RuntimeTypeReprs,
> = never;

export const validateRuntimeTypeRepr = <T, K extends keyof RuntimeTypeReprs>(
	repr: { type: K } & RuntimeTypeReprs<T>[K]["repr"],
): RuntimeType<RuntimeTypeReprs<T>[K]["type"]> => {
	return repr as any;
};

export interface RuntimeTypeReprs<T = any> {
	boolean: { params: never; repr: { type: "boolean" }; type: boolean };
}
export const boolean = validateRuntimeTypeRepr({ type: "boolean" });

export interface RuntimeTypeReprs<T = any> {
	number: { repr: { type: "number" }; type: number };
}
export const number = validateRuntimeTypeRepr({ type: "number" });

export interface RuntimeTypeReprs<T = any> {
	string: { repr: { type: "string" }; type: string };
}
export const string = validateRuntimeTypeRepr({ type: "string" });

export interface RuntimeTypeReprs<T = any> {
	symbol: { repr: { type: "symbol" }; type: symbol };
}
export const symbol = validateRuntimeTypeRepr({ type: "symbol" });

export interface RuntimeTypeReprs<T = any> {
	bigint: { repr: { type: "bigint" }; type: bigint };
}
export const bigint = validateRuntimeTypeRepr({ type: "bigint" });

type AnyClass = abstract new (...args: never) => unknown;

export interface RuntimeTypeReprs<T = any> {
	class: {
		repr: { type: "class"; class: T & AnyClass };
		type: InstanceType<T & AnyClass>;
	};
}

/** Unsafe for generic classes. */
export const Class = <Class extends AnyClass>(class_: Class) =>
	validateRuntimeTypeRepr<Class, "class">({ type: "class", class: class_ });

export interface RuntimeTypeReprs<T = any> {
	Array: { repr: { type: "Array"; item: RuntimeType<T> }; type: T[] };
}
export const Array = <T>(item: RuntimeType<T>) =>
	validateRuntimeTypeRepr<T, "Array">({ type: "Array", item });

export interface RuntimeTypeReprs<T = any> {
	ReadonlyArray: {
		repr: { type: "ReadonlyArray"; item: RuntimeType<T> };
		type: readonly T[];
	};
}
export const ReadonlyArray = <T>(item: RuntimeType<T>) =>
	validateRuntimeTypeRepr<T, "ReadonlyArray">({ type: "ReadonlyArray", item });

type IsAny<T> = 1 extends T & 0 ? true : false;
type TryGet<T, K extends PropertyKey> =
	IsAny<T> extends true ? any : T extends Record<K, infer V> ? V : never;

export interface RuntimeTypeReprs<T = any> {
	Record: {
		repr: {
			type: "Record";
			key: RuntimeType<TryGet<T, 0>>;
			value: RuntimeType<TryGet<T, 1>>;
		};
		type: Record<Extract<TryGet<T, 0>, PropertyKey>, TryGet<T, 1>>;
	};
}
export const Record = <K extends PropertyKey, V>(key: RuntimeType<K>, value: RuntimeType<V>) =>
	validateRuntimeTypeRepr<[K, V], "Record">({ type: "Record", key, value });

export interface RuntimeTypeReprs<T = any> {
	Map: {
		repr: {
			type: "Map";
			key: RuntimeType<TryGet<T, 0>>;
			value: RuntimeType<TryGet<T, 1>>;
		};
		type: Map<TryGet<T, 0>, TryGet<T, 1>>;
	};
}
export const Map = <K, V>(key: RuntimeType<K>, value: RuntimeType<V>) =>
	validateRuntimeTypeRepr<[K, V], "Map">({ type: "Map", key, value });

export interface RuntimeTypeReprs<T = any> {
	ReadonlyMap: {
		repr: {
			type: "ReadonlyMap";
			key: RuntimeType<TryGet<T, 0>>;
			value: RuntimeType<TryGet<T, 1>>;
		};
		type: ReadonlyMap<TryGet<T, 0>, TryGet<T, 1>>;
	};
}
export const ReadonlyMap = <K, V>(key: RuntimeType<K>, value: RuntimeType<V>) =>
	validateRuntimeTypeRepr<[K, V], "ReadonlyMap">({
		type: "ReadonlyMap",
		key,
		value,
	});

export interface RuntimeTypeReprs<T = any> {
	WeakMap: {
		repr: {
			type: "WeakMap";
			key: RuntimeType<TryGet<T, 0>>;
			value: RuntimeType<TryGet<T, 1>>;
		};
		type: WeakMap<Extract<TryGet<T, 0>, WeakKey>, TryGet<T, 1>>;
	};
}
export const WeakMap = <K extends WeakKey, V>(key: RuntimeType<K>, value: RuntimeType<V>) =>
	validateRuntimeTypeRepr<[K, V], "WeakMap">({ type: "WeakMap", key, value });

export interface RuntimeTypeReprs<T = any> {
	Set: {
		repr: { type: "Set"; item: RuntimeType<T> };
		type: Set<T>;
	};
}
export const Set = <T>(item: RuntimeType<T>) =>
	validateRuntimeTypeRepr<T, "Set">({ type: "Set", item });

export interface RuntimeTypeReprs<T = any> {
	ReadonlySet: {
		repr: { type: "ReadonlySet"; item: RuntimeType<T> };
		type: ReadonlySet<T>;
	};
}
export const ReadonlySet = <T>(item: RuntimeType<T>) =>
	validateRuntimeTypeRepr<T, "ReadonlySet">({ type: "ReadonlySet", item });

export interface RuntimeTypeReprs<T = any> {
	WeakSet: {
		repr: { type: "WeakSet"; item: RuntimeType<T> };
		type: WeakSet<Extract<T, WeakKey>>;
	};
}
export const WeakSet = <T extends WeakKey>(item: RuntimeType<T>) =>
	validateRuntimeTypeRepr<T, "WeakSet">({ type: "WeakSet", item });

export interface RuntimeTypeReprs<T = any> {
	WeakRef: {
		repr: { type: "WeakRef"; item: RuntimeType<T> };
		type: WeakRef<Extract<T, WeakKey>>;
	};
}
export const WeakRef = <T extends WeakKey>(item: RuntimeType<T>) =>
	validateRuntimeTypeRepr<T, "WeakRef">({ type: "WeakRef", item });

export interface RuntimeTypeReprs<T = any> {
	Promise: {
		repr: { type: "Promise"; item: RuntimeType<T> };
		type: Promise<T>;
	};
}
export const Promise = <T>(item: RuntimeType<T>) =>
	validateRuntimeTypeRepr<T, "Promise">({ type: "Promise", item });
