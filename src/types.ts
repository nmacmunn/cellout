type AnyFn = (...args: any) => any;

export type Controls<E extends Exits> = { exit: Exit<E>; trap: Trap<E> };

/**
 * Function that can only be invoked with the name of an exit and the
 * corresponding parameters.
 */
interface Exit<E extends Exits> {
  <K extends keyof E>(...args: [K, ...Parameters<E[K]>]): never;
}

/**
 * Functions defining typesafe exits for an operation
 */
export type Exits = Record<PropertyKey, AnyFn>;

/**
 * Union of exit return types
 */
type ExitReturnTypes<E extends Exits> = {
  [K in keyof E]: ReturnType<E[K]>;
}[keyof E];

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
 * Function that can only be invoked with the name of an exit, the corresponding
 * parameters, and a callback that could throw.
 */
interface Trap<E extends Exits> {
  <K extends keyof TrapExits<E>, Return>(
    ...args: [K, ...TrapParams<E[K]>, () => Return]
  ): Return;
}

/**
 * Function that can trap i.e. last parameter is unknown
 */
type TrapExit<Exit extends AnyFn> = Exit extends (
  ...args: [...infer Params]
) => any
  ? UnknownLast<Params> extends true
    ? Exit
    : never
  : never;

/**
 * Subset of Exits that can trap
 */
type TrapExits<E extends Exits> = {
  [K in keyof E as E[K] extends TrapExit<E[K]> ? K : never]: E[K];
};

/**
 * Parameters required by trap for a particular exit
 */
type TrapParams<Exit extends AnyFn> = Exit extends (
  ...args: [...infer Params, unknown]
) => any
  ? Params
  : never;

/**
 * Utility type that is true if A is a tuple with the last element unknown
 */
type UnknownLast<T> = T extends [infer First, ...infer Rest]
  ? // A is array
    Rest extends []
    ? // Rest is empty
      [unknown] extends T
      ? // First is unknown
        true
      : // First not unknown
        false
    : // Rest not empty, call recursively
      UnknownLast<Rest>
  : // A not array
    false;
