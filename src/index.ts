type AnyFn = (...args: any) => any;

/**
 * Functions defining typesafe exits for an operation
 */
type Channels = Record<PropertyKey, AnyFn>;

type ChannelParams = Record<PropertyKey, unknown[]>;

type ChannelsFromParams<C extends ChannelParams> = {
  [K in keyof C]: (...args: C[K]) => any;
};

/**
 * Function that can only be invoked with the name of an exit and the
 * corresponding parameters.
 */
type Exit<C extends Channels> = (
  ...args: {
    [K in keyof C]: [K, ...Parameters<C[K]>];
  }[keyof C]
) => never;

/**
 * If the type of the last item is unknown, return the tuple type without that
 * item.
 */
type NoUnknownLast<T> = T extends [...head: infer Head, last?: infer Last]
  ? [unknown] extends [Last]
    ? [] extends Head
      ? []
      : Head
    : [...Head, Last]
  : [];

/**
 * Function that can only be invoked with the name of an exit, the corresponding
 * parameters, and a callback that could throw.
 */
type Trap<C extends Channels> = <Return>(
  ...args: {
    [K in keyof C]: [K, ...NoUnknownLast<Parameters<C[K]>>, () => Return];
  }[keyof C]
) => Return;

/**
 * Union of exit return types
 */
type ReturnTypes<C extends Channels> = {
  [K in keyof C]: ReturnType<C[K]>;
}[keyof C];

/**
 * Return type of run is a union of the operation and channel return types and
 * is async if operation is.
 */
type RunReturnType<C extends Channels, Return> = [Return] extends [never]
  ? // only the exit return types
    ReturnTypes<C>
  : Return extends Promise<unknown>
  ? // async union of operation and exit return types
    Promise<Awaited<Return> | Awaited<ReturnTypes<C>>>
  : // union of operation and exit return types
    Return | ReturnTypes<C>;

/**
 * Container used to identify internal exceptions
 */
class Carrier {
  constructor(public key: PropertyKey, public args: unknown[]) {}
}

export interface Gbye<C extends ChannelParams> {
  exit: Exit<ChannelsFromParams<C>>;
  trap: Trap<ChannelsFromParams<C>>;
}

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
 * @param channels
 * An object containing functions that handle different exit conditions.
 * Specified function parameters become required arguments for exit and trap.
 * If the final parameter of a channel has type unknown, the channel is eligible
 * to use with trap. In that case, the final argument will be the value thrown
 * by the trapped function.
 *
 * @returns
 */
export function run<C extends Channels, Return>(
  operation: (gbye: { exit: Exit<C>; trap: Trap<C> }) => Return,
  channels: C
): RunReturnType<C, Return> {
  // called when op throws or rejects
  function onCatch(e: unknown) {
    if (e instanceof Carrier) {
      return channels[e.key](...e.args);
    }
    throw e;
  }
  try {
    const result = operation({
      exit: <K extends keyof C>(key: K, ...args: Parameters<C[K]>) => {
        throw new Carrier(key, args);
      },
      trap: <K extends keyof C>(
        key: K,
        ...args: [...NoUnknownLast<Parameters<C[K]>>, () => any]
      ) => {
        const cb = args.pop();
        function onCatch(e: unknown): never {
          throw new Carrier(key, [...args, e]);
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
      return result.catch(onCatch) as RunReturnType<C, Return>;
    } else {
      return result as RunReturnType<C, Return>;
    }
  } catch (e) {
    return onCatch(e);
  }
}
