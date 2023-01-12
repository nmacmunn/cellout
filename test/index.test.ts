import { describe, expect, test } from "@jest/globals";
import { run } from "../src/run";
import { Gbye } from "../src/types";

/**
 * Should check exit params
 */
() => {
  const result: void = run(
    ({ exit }) => {
      exit("fail", "something went wrong");
      // @ts-expect-error
      exit("fail");
    },
    {
      fail: (reason: string) => {},
    }
  );
};

/**
 * Optional exit param
 */
() => {
  const result: void = run(
    ({ exit }) => {
      exit("fail", "something went wrong");
      exit("fail", "something went wrong", new Error());
    },
    {
      fail: (reason: string, error?: unknown) => {},
    }
  );
};

/**
 * Should check trap params
 */
() => {
  const result: void = run(
    ({ trap }) => {
      trap("fail", () => JSON.parse(""));
      trap("ignore", () => JSON.parse(""));
      // @ts-expect-error
      trap("fail", new Error());
    },
    {
      fail: (error: unknown) => {},
      ignore: () => {},
    }
  );
};

/**
 * Optional trap param
 */
() => {
  const result: void = run(
    ({ trap }) => {
      trap("fail", () => JSON.parse(""));
      // @ts-expect-error
      trap("fail", new Error());
    },
    {
      fail: (error?: unknown) => {},
    }
  );
};

/**
 * Return type should be union of operation return type and exit return
 * types
 */
() => {
  const result: string | boolean = run(() => "", {
    fail: (reason: string) => false,
  });
};

/**
 * Return type should be union of exit return types
 */
() => {
  const result: boolean = run(
    ({ exit }) => {
      throw exit("fail", "something went wrong");
    },
    {
      fail: (reason: string) => false,
    }
  );
};

/**
 * Return type should be a promise if operation is async
 */
() => {
  const result: Promise<boolean> = run(
    async ({ exit }) => {
      throw exit("fail", "something went wrong");
    },
    {
      fail: (reason: string) => false,
    }
  );
};

/**
 * Return type of trap should be return type of callback
 */
() => {
  run(
    ({ trap }) => {
      const result: number = trap("fail", () => parseInt(""));
    },
    {
      fail: (error: unknown) => {},
    }
  );
};

/**
 * Missing exit
 */
() => {
  run(({ exit }) => {
    // @ts-expect-error
    exit("fail");
  }, {});
};

/**
 * Missing exit argument
 */
() => {
  run(
    ({ exit }) => {
      // @ts-expect-error
      exit("fail");
    },
    {
      fail: (reason: string) => {},
    }
  );
};

/**
 * Wrong exit argument type
 */
() => {
  run(
    ({ exit }) => {
      // @ts-expect-error
      exit("fail", 0);
    },
    {
      fail: (reason: string) => {},
    }
  );
};

/**
 * Missing trap function
 */
() => {
  run(({ trap }) => {
    // @ts-expect-error
    trap("fail", "broken", () => JSON.parse(""));
  }, {});
};

/**
 * Invalid trap function
 */
() => {
  run(
    ({ trap }) => {
      // @ts-expect-error
      trap("fail", "broken", () => JSON.parse(""));
    },
    {
      fail: () => {},
    }
  );
};

/**
 * Wrong trap argument type
 */
() => {
  run(
    ({ trap }) => {
      // @ts-expect-error
      trap("fail", "broken", () => JSON.parse(""));
    },
    {
      fail: (error: unknown) => {},
    }
  );
};

/*
 * Trap return type
 */
() => {
  run(
    ({ trap }) => {
      let result: string;
      result = trap("fail", () => "");
      // @ts-expect-error
      result = trap("fail", () => parseInt(""));
    },
    {
      fail: (error: unknown) => {},
    }
  );
};

/**
 * Assignability
 */
() => {
  const op = (gbye: Gbye<{ a: [string] }>) => {};
  // @ts-expect-error
  run(op, {});
  // @ts-expect-error
  run(op, { a: (val: number) => val });
  run(op, { a: (val: string) => val });
  // @ts-expect-error
  run(op, { a: (val: string, code: number) => val });
  // @ts-expect-error
  run(op, { a: (val: string, error: unknown) => val });
  run(op, { a: (val: string, error?: unknown) => val });

  function a(gbye: Gbye<{ a: [] }>) {}
  function b(gbye: Gbye<{ b: [unknown] }>) {}
  function ab(gbye: Gbye<{ a: []; b: [unknown] }>) {}

  function empty() {}
  function maybeUnknown(val?: unknown) {}
  function unknown(val: unknown) {}

  run(a, { a: empty });
  run(a, { a: maybeUnknown });
  // @ts-expect-error
  run(a, { a: unknown });
  // @ts-expect-error
  run(a, { b: empty });
  // @ts-expect-error
  run(a, { b: maybeUnknown });
  // @ts-expect-error
  run(a, { b: unknown });
  run(a, { a: empty, b: empty });
  run(a, { a: maybeUnknown, b: empty });
  // @ts-expect-error
  run(a, { a: unknown, b: empty });
  run(a, { a: empty, b: maybeUnknown });
  run(a, { a: maybeUnknown, b: maybeUnknown });
  // @ts-expect-error
  run(a, { a: unknown, b: maybeUnknown });
  run(a, { a: empty, b: unknown });
  run(a, { a: maybeUnknown, b: unknown });
  // @ts-expect-error
  run(a, { a: unknown, b: unknown });

  // @ts-expect-error
  run(b, { a: empty });
  // @ts-expect-error
  run(b, { a: maybeUnknown });
  // @ts-expect-error
  run(b, { a: unknown });
  /**
   * @todo why does this pass but not:
   * run(b, { a: empty, b: empty })
   */
  run(b, { b: empty });
  run(b, { b: maybeUnknown });
  run(b, { b: unknown });
  // @ts-expect-error
  run(b, { a: empty, b: empty });
  // @ts-expect-error
  run(b, { a: maybeUnknown, b: empty });
  // @ts-expect-error
  run(b, { a: unknown, b: empty });
  run(b, { a: empty, b: maybeUnknown });
  run(b, { a: maybeUnknown, b: maybeUnknown });
  run(b, { a: unknown, b: maybeUnknown });
  run(b, { a: empty, b: unknown });
  run(b, { a: maybeUnknown, b: unknown });
  run(b, { a: unknown, b: unknown });

  // @ts-expect-error
  run(ab, { a: empty });
  // @ts-expect-error
  run(ab, { a: maybeUnknown });
  // @ts-expect-error
  run(ab, { a: unknown });
  // @ts-expect-error
  run(ab, { b: empty });
  // @ts-expect-error
  run(ab, { b: maybeUnknown });
  // @ts-expect-error
  run(ab, { b: unknown });
  // @ts-expect-error
  run(ab, { a: empty, b: empty });
  // @ts-expect-error
  run(ab, { a: maybeUnknown, b: empty });
  // @ts-expect-error
  run(ab, { a: unknown, b: empty });
  run(ab, { a: empty, b: maybeUnknown });
  run(ab, { a: maybeUnknown, b: maybeUnknown });
  // @ts-expect-error
  run(ab, { a: unknown, b: maybeUnknown });
  run(ab, { a: empty, b: unknown });
  run(ab, { a: maybeUnknown, b: unknown });
  // @ts-expect-error
  run(ab, { a: unknown, b: unknown });
};

describe("gbye", () => {
  test("should return a result", () => {
    const result = run(() => true, {});
    expect(result).toBe(true);
  });
  test("should return an async result", async () => {
    const result = await run(async () => true, {});
    expect(result).toBe(true);
  });
  test("should not catch unknown errors", () => {
    const e = new Error();
    expect(() =>
      run(() => {
        throw e;
      }, {})
    ).toThrow(e);
  });
  test("should not catch unknown rejections", async () => {
    expect.assertions(1);
    const e = new Error();
    try {
      await run(async () => {
        throw e;
      }, {});
    } catch (caught) {
      expect(caught).toBe(e);
    }
  });
  describe("exit", () => {
    test("should return by a specific exit", () => {
      const result = run(
        ({ exit }) => {
          exit("fail");
          return true;
        },
        {
          fail: () => false,
        }
      );
      expect(result).toBe(false);
    });
    test("should return asynchronously by a specific exit", async () => {
      const result = await run(
        async ({ exit }) => {
          exit("fail");
          return true;
        },
        {
          fail: () => false,
        }
      );
      expect(result).toBe(false);
    });
    test("should pass arguments to the specified exit", () => {
      const result = run(
        ({ exit }) => {
          exit("fail", "foo", "bar");
          return true;
        },
        {
          fail: (foo: string, bar: string) => [foo, bar],
        }
      );
      expect(result).toEqual(["foo", "bar"]);
    });
  });
  describe("trap", () => {
    test("should return result if function doesn't throw", () => {
      const result = run(
        ({ trap }) => {
          return trap("fail", () => true);
        },
        {
          fail: (error: unknown) => false,
        }
      );
      expect(result).toBe(true);
    });
    test("should return async result if function doesn't throw", async () => {
      const result = await run(
        ({ trap }) => {
          return trap("fail", async () => true);
        },
        {
          fail: (error: unknown) => false,
        }
      );
      expect(result).toBe(true);
    });
    test("should pass arguments to the specified exit", () => {
      const e = new Error();
      const result = run(
        ({ trap }) => {
          trap("fail", "foo", "bar", () => {
            throw e;
          });
          return true;
        },
        {
          fail: (foo: string, bar: string, error: unknown) => [foo, bar, error],
        }
      );
      expect(result).toEqual(["foo", "bar", e]);
    });
  });
});
