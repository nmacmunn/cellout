import { describe, expect, test } from "@jest/globals";
import { run, trap, type Gbye } from "../src/index";

//
// TYPES
//

/**
 * run
 */
() => {
  run(
    (gbye) => gbye("error"),
    (reason: string, err?: unknown) => {}
  );
  run(
    (gbye) => gbye("error", new Error()),
    (reason: string, err?: unknown) => {}
  );
  run(
    // @ts-expect-error: wrong arg type
    (gbye) => gbye(0),
    (reason: string, err?: unknown) => {}
  );
  // @ts-expect-error: missing handler
  run((gbye) => gbye("error"));
  run(
    // @ts-expect-error: missing arg
    (gbye) => gbye(),
    (reason: string, err?: unknown) => {}
  );
  run(
    (gbye) => true,
    // @ts-expect-error: invalid handler arg type
    (err: unknown) => {}
  );
  const result: string | boolean = run(
    (gbye) => true,
    (reason: string) => reason
  );
  // @ts-expect-error: wrong return type
  const wrongResult: boolean = run(
    (gbye) => true,
    (reason: string) => reason
  );
  const resultP: Promise<string | boolean> = run(
    async (gbye) => true,
    (reason: string) => reason
  );
  const resultP2: Promise<string | boolean> = run(
    async (gbye) => true,
    async (reason: string) => reason
  );
  const resultP3: boolean | Promise<string> = run(
    (gbye) => true,
    async (reason: string) => reason
  );
  // @ts-expect-error: wrong return type
  const wrongResultP: Promise<boolean> = run(
    async (gbye) => true,
    (reason: string) => reason
  );

  //
  // Assignability
  //

  function emptyHandler() {}
  function emptyHandlerE(err?: unknown) {}
  function maybeUnknownHandler(val?: unknown) {}
  function maybeUnknownHandlerE(val?: unknown, err?: unknown) {}
  function unknownHandler(val: unknown) {}
  function unknownHandlerE(val: unknown, err?: unknown) {}
  function strHandler(val: string) {}
  function strHandlerE(val: string, err?: unknown) {}
  function numHandler(val: number) {}
  function numHandlerE(val: number, err?: unknown) {}
  function strOrNumHandler(val: string | number) {}
  function strOrNumHandlerE(val: string | number, err?: unknown) {}

  function noOp() {}

  // @ts-expect-error
  run(noOp, emptyHandler);
  // @ts-expect-error
  run(noOp, emptyHandlerE);
  // @ts-expect-error
  run(noOp, maybeUnknownHandler);
  // @ts-expect-error
  run(noOp, maybeUnknownHandlerE);
  // @ts-expect-error
  run(noOp, unknownHandler);
  // @ts-expect-error
  run(noOp, unknownHandlerE);
  run(noOp, strHandler);
  run(noOp, strHandlerE);
  run(noOp, numHandler);
  run(noOp, numHandlerE);
  run(noOp, strOrNumHandler);
  run(noOp, strOrNumHandlerE);

  function strOp(gbye: Gbye<string>) {
    throw gbye("", new Error());
  }

  // @ts-expect-error
  run(strOp, emptyHandler);
  // @ts-expect-error
  run(strOp, emptyHandlerE);
  // @ts-expect-error
  run(strOp, maybeUnknownHandler);
  // @ts-expect-error
  run(strOp, maybeUnknownHandlerE);
  // @ts-expect-error
  run(strOp, unknownHandler);
  // @ts-expect-error
  run(strOp, unknownHandlerE);
  run(strOp, strHandler);
  run(strOp, strHandlerE);
  // @ts-expect-error
  run(strOp, numHandler);
  // @ts-expect-error
  run(strOp, numHandlerE);
  run(strOp, strOrNumHandler);
  run(strOp, strOrNumHandlerE);

  function numOp(gbye: Gbye<number>) {
    throw gbye(0, new Error());
  }

  // @ts-expect-error
  run(numOp, emptyHandler);
  // @ts-expect-error
  run(numOp, emptyHandlerE);
  // @ts-expect-error
  run(numOp, maybeUnknownHandler);
  // @ts-expect-error
  run(numOp, maybeUnknownHandlerE);
  // @ts-expect-error
  run(numOp, unknownHandler);
  // @ts-expect-error
  run(numOp, unknownHandlerE);
  // @ts-expect-error
  run(numOp, strHandler);
  // @ts-expect-error
  run(numOp, strHandlerE);
  run(numOp, numHandler);
  run(numOp, numHandlerE);
  run(numOp, strOrNumHandler);
  run(numOp, strOrNumHandlerE);

  function strOrNumOp(gbye: Gbye<string | number>) {
    throw gbye(0, new Error());
  }

  // @ts-expect-error
  run(strOrNumOp, emptyHandler);
  // @ts-expect-error
  run(strOrNumOp, emptyHandlerE);
  // @ts-expect-error
  run(strOrNumOp, maybeUnknownHandler);
  // @ts-expect-error
  run(strOrNumOp, maybeUnknownHandlerE);
  // @ts-expect-error
  run(strOrNumOp, unknownHandler);
  // @ts-expect-error
  run(strOrNumOp, unknownHandlerE);
  // @ts-expect-error
  run(strOrNumOp, strHandler);
  // @ts-expect-error
  run(strOrNumOp, strHandlerE);
  // @ts-expect-error
  run(strOrNumOp, numHandler);
  // @ts-expect-error
  run(strOrNumOp, numHandlerE);
  run(strOrNumOp, strOrNumHandler);
  run(strOrNumOp, strOrNumHandlerE);
};

/**
 * trap
 */
() => {
  run(
    (gbye) => {
      const result: number = trap(gbye, () => parseInt(""), "parse fail");
      // @ts-expect-error: missing argument
      trap(gbye, () => parseInt(""));
      // @ts-expect-error: wrong argument type
      trap(gbye, () => parseInt(""), 1);
      // @ts-expect-error: wrong return type
      const wrong: string = trap(gbye, () => parseInt(""), "parse fail");
    },
    (reason: string, error?: unknown) => {}
  );
};

//
// RUNTIME
//

describe("gbye", () => {
  test("should return a result", () => {
    const result = run(
      () => true,
      (reason: string) => {}
    );
    expect(result).toBe(true);
  });
  test("should return an async result", async () => {
    const result = await run(
      async () => true,
      (reason: string) => {}
    );
    expect(result).toBe(true);
  });
  test("should not catch unknown errors", () => {
    const e = new Error();
    expect(() =>
      run(
        () => {
          throw e;
        },
        (reason: string) => {}
      )
    ).toThrow(e);
  });
  test("should not catch unknown rejections", async () => {
    expect.assertions(1);
    const e = new Error();
    try {
      await run(
        async () => {
          throw e;
        },
        (reason: string) => {}
      );
    } catch (caught) {
      expect(caught).toBe(e);
    }
  });
  describe("exit", () => {
    test("should return the handler result", () => {
      const result = run(
        (gbye) => {
          gbye("fail");
          return true;
        },
        (reason: string) => false
      );
      expect(result).toBe(false);
    });
    test("should return asynchronously by a specific exit", async () => {
      const result = await run(
        async (gbye) => {
          gbye("fail");
          return true;
        },
        (reason: string) => false
      );
      expect(result).toBe(false);
    });
    test("should pass val to the handler", () => {
      const e = new Error();
      const result = run(
        (gbye) => {
          gbye("fail", e);
          return true;
        },
        (reason: string, error: unknown) => [reason, error]
      );
      expect(result).toEqual(["fail", e]);
    });
  });
  describe("trap", () => {
    test("should return result if function doesn't throw", () => {
      const result = run(
        (gbye) => {
          return trap(gbye, () => true, "fail");
        },
        (reason: string) => false
      );
      expect(result).toBe(true);
    });
    test("should return async result if function doesn't throw", async () => {
      const result = await run(
        (gbye) => {
          return trap(gbye, async () => true, "fail");
        },
        (reason: string) => false
      );
      expect(result).toBe(true);
    });
    test("should pass arguments to the specified exit", () => {
      const e = new Error();
      const result = run(
        (gbye) => {
          trap(
            gbye,
            () => {
              throw e;
            },
            "fail"
          );
          return true;
        },
        (reason: string, error: unknown) => [reason, error]
      );
      expect(result).toEqual(["fail", e]);
    });
  });
});
