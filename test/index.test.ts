import { describe, expect, test } from "@jest/globals";
import { run } from "../src/run";

/**
 * Should check exit params
 */
() => {
  const result: void = run(
    ({ exit }) => {
      exit("fail", "something went wrong");
    },
    {
      fail: (reason: string) => {},
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
    },
    {
      fail: (error: unknown) => {},
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
