type AnyFn = (...args: any) => any;

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

/**
 * Functions defining typesafe exits for an operation
 */
type Exits = Record<PropertyKey, AnyFn>;

/**
 * Function that can only be invoked with the name of an exit and the
 * corresponding parameters.
 */
interface Exit<E extends Exits> {
  <K extends keyof E>(...args: [K, ...Parameters<E[K]>]): never;
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
 * Function that can only be invoked with the name of an exit, the corresponding
 * parameters, and a callback that could throw.
 */
interface Trap<E extends Exits> {
  <K extends keyof TrapExits<E>, Return>(
    ...args: [K, ...TrapParams<E[K]>, () => Return]
  ): Return;
}

/**
 * Container used to identify exceptions throw by us
 */
class Carrier {
  constructor(public key: PropertyKey, public args: unknown[]) {}
}

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
type RunReturnType<E extends Exits, Return> = [Return] extends [never]
  ? // only the exit return types
    ExitReturnTypes<E>
  : Return extends Promise<unknown>
  ? // async union of operation and exit return types
    Promise<Awaited<Return> | Awaited<ExitReturnTypes<E>>>
  : // union of operation and exit return types
    Return | ExitReturnTypes<E>;

/**
 * Run a function with controls for throwing errors in a typesafe manner.
 *
 * @param operation
 * The function to invoke. Receives an object as its first parameter containing
 * two functions that should be used for flow control: exit and trap.
 *
 * exit is invoked with an exit function name and parameters
 *
 * trap is invoked with an exit function name, parameters (except the last one
 * which must be unknown), and a function to try
 *
 * @param exits
 * An object containing functions that handle different exit conditions.
 * Specified function parameters become required arguments for exit and trap.
 * If the final parameter of an exit has type unknown, the exit is eligible
 * to use with trap. In that case, the final argument will be the value thrown
 * by the trapped function.
 *
 * @returns
 */
export function run<E extends Exits, Return>(
  operation: (commands: { exit: Exit<E>; trap: Trap<E> }) => Return,
  exits: E
): RunReturnType<E, Return> {
  // called when op throws or rejects
  function onCatch(e: unknown) {
    if (e instanceof Carrier) {
      return exits[e.key](...e.args);
    }
    throw e;
  }
  try {
    const result = operation({
      exit: (key, ...args) => {
        throw new Carrier(key, args);
      },
      trap: (key, ...args) => {
        const cb = args.pop();
        function onCatch(e: unknown): never {
          args.push(e);
          throw new Carrier(key, args);
        }
        try {
          const result = (cb as AnyFn)();
          if (result instanceof Promise) {
            return result.catch(onCatch) as never;
          }
          return result;
        } catch (e) {
          onCatch(e);
        }
      },
    });
    if (result instanceof Promise) {
      return result.catch(onCatch) as RunReturnType<E, Return>;
    } else {
      return result as RunReturnType<E, Return>;
    }
  } catch (e) {
    return onCatch(e);
  }
}
