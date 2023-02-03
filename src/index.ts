/**
 * Execute an operation with a mechanism for throwing typesafe exceptions.
 *
 * @param operation
 * The operation to invoke. Receives a single `gbye` parameter which can
 * be called to abort the operation and return to `handler`. The first `gbye`
 * parameter must match that of `handler` and the second optional parameter can
 * be anything.
 *
 * @param handler
 * Exception handler for `operation`. When `operation` is terminated by calling
 * `gbye`, `handler` is invoked with the arguments passed to `gbye`. Handler is
 * only called for exceptions thrown with `gbye`.
 *
 * @returns
 * The return value of `operation` if successful, or `handler` if `gbye` is
 * called. If `operation` is asynchronous, the result will be a promise.
 */
export function run<T, U extends T, Success, Fail>(
  operation: (gbye: Gbye<U>) => Success,
  handler: Handler<T, Fail>
): RunReturnType<Success, Fail> {
  // called when op throws or rejects
  function onCatch(e: unknown) {
    if (e instanceof Carrier) {
      return handler(e.val as T, e.error);
    }
    throw e;
  }
  function gbye(val: T, err?: unknown): never {
    throw new Carrier(val, err);
  }
  try {
    const result = operation(gbye);
    if (result instanceof Promise) {
      // async success or fail
      return result.catch(onCatch) as RunReturnType<Success, Fail>;
    } else {
      // sync success
      return result as RunReturnType<Success, Fail>;
    }
  } catch (e) {
    // sync fail
    return onCatch(e) as RunReturnType<Success, Fail>;
  }
}

/**
 * Utility for wrapping functions that could throw such that they terminate
 * an operation via `gbye`. When that happens, the run `handler` is invoked
 * with `val` as the first parameter, and the thrown exception as the second.
 *
 * @param gbye
 * Callback provided by `run` to terminate the current operation.
 *
 * @param tryFn
 * A function to call that could throw an unknown error.
 *
 * @param val
 * A value with the type expected by the run `handler` to identify this
 * exception.
 *
 * @returns
 * The result of `tryFn`.
 */
export function trap<T, R>(gbye: Gbye<T>, tryFn: () => R, val: T): R {
  const onCatch = (err: unknown) => gbye(val, err);
  try {
    const result = tryFn();
    if (result instanceof Promise) {
      return result.catch(onCatch) as R;
    }
    return result;
  } catch (e) {
    throw onCatch(e);
  }
}

/**
 * Defines the signature of `gbye`. Used to indicate the type of expections
 * that a function can safely throw.
 */
export type Gbye<T> = (val: T, err?: unknown) => never;

/**
 * Used to differentiate `gbye` exceptions from unhandled ones
 * @private
 */
class Carrier {
  constructor(public val: unknown, public error?: unknown) {}
}

type Handler<T, R> = unknown extends T ? never : (val: T, err?: unknown) => R;

type RunReturnType<Success, Fail> = Success extends Promise<unknown>
  ? Promise<Awaited<Success> | Awaited<Fail>>
  : Success | Fail;
