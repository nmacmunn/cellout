type AnyFn = (...args: any) => any;

/**
 * Type of the object that is passed to operation
 */
export type Controls<S extends Spec> = {
  exit: Exit<S>;
  trap: Trap<TrapSpec<S>>;
};

/**
 * Function that can only be invoked with the name of an exit and the
 * corresponding parameters.
 */
type Exit<S extends Spec> = (...args: ExitArgs<S>) => never;

/**
 * Args required to call exit: exit key follow by user args
 */
type ExitArgs<S extends Spec> = {
  [K in keyof S]: [K, ...S[K]];
}[keyof S];

/**
 * User-defined functions that describe the exit points for an operation
 */
export type Exits = Record<PropertyKey, AnyFn>;

/**
 * Union of exit return types
 */
type ExitReturnTypes<E extends Exits> = {
  [K in keyof E]: ReturnType<E[K]>;
}[keyof E];

/**
 * T without last element
 */
type Head<T> = T extends [...infer Head, infer Last] ? Head : never;

/**
 * Return type of run is a union of the operation and exit return types and
 * is async if operation is.
 */
export type RunReturnType<E extends Exits, Return> = [Return] extends [never]
  ? // only the exit return types
    ExitReturnTypes<E>
  : Return extends Promise<unknown>
  ? // async union of operation and exit return types
    Promise<Awaited<Return> | Awaited<ExitReturnTypes<E>>>
  : // union of operation and exit return types
    Return | ExitReturnTypes<E>;

/**
 * Exit function name => parameters
 */
export type Spec<E extends Exits = Exits> = {
  [K in keyof E]: Parameters<E[K]>;
};

/**
 * Function that can only be invoked with the name of an exit, the corresponding
 * parameters, and a callback that could throw.
 */
type Trap<S extends Spec> = <R>(...args: TrapArgs<S, R>) => R;

/**
 * Args required to call trap: exit key, user args, function that could throw
 */
type TrapArgs<S extends Spec, R> = {
  [K in keyof S]: [K, ...Head<S[K]>, () => R];
}[keyof S];

/**
 * Subset of Specs that can trap
 */
type TrapSpec<S extends Spec> = {
  [K in keyof S as S[K] extends UnknownLast<S[K]> ? K : never]: S[K];
};

/**
 * Resolves to T if it's a tuple with last element unknown
 */
type UnknownLast<T> = T extends [...infer Head, infer Last]
  ? unknown extends Last
    ? T
    : never
  : never;
