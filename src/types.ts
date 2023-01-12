export type AnyFn = (...args: any) => any;

/**
 * User-defined functions that represent safe exit points for an operation
 */
export type Channels = Record<PropertyKey, AnyFn>;

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
 * First argument passed to operation
 */
export interface Gbye<S extends Spec> {
  exit: Exit<S>;
  trap: Trap<S>;
}

/**
 * Union of channel return types
 */
type ChannelReturnTypes<C extends Channels> = {
  [K in keyof C]: ReturnType<C[K]>;
}[keyof C];

/**
 * Return type of run is a union of the operation and channel return types and
 * is async if operation is.
 */
export type RunReturnType<C extends Channels, Return> = [Return] extends [never]
  ? // only the exit return types
    ChannelReturnTypes<C>
  : Return extends Promise<unknown>
  ? // async union of operation and exit return types
    Promise<Awaited<Return> | Awaited<ChannelReturnTypes<C>>>
  : // union of operation and exit return types
    Return | ChannelReturnTypes<C>;

/**
 * Exit function name => parameters
 */
export type Spec<C extends Channels = Channels> = {
  [K in keyof C]: Parameters<C[K]>;
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
  [K in keyof S]: [K, ...NoUnknownLast<S[K]>, () => R];
}[keyof S];

/**
 * Remove the final element from a tuple type if it's unknown
 */
type NoUnknownLast<T> = T extends [...head: infer H, last?: infer L]
  ? unknown extends L
    ? [] extends H
      ? []
      : H
    : T
  : [];
