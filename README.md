# gbye

TypeScript library combining the convenience of `throw` with the type safety of return codes.

### Installation

```sh
npm install --save gbye
```

### Overview

The main function `run` receives an `operation`, wraps it in a `try-catch`, and passes it an object with two methods: `exit` and `trap`. The second argument to `run` is a `channels` object defining type-safe exit points for `operation`. When `exit` is called with the name and arguments of a channel, it throws an exception that immediately terminates `operation` and invokes the channel function. `run` returns the result of `operation` or one of the `channels`. Any exception throw without `exit` or `trap` will not be caught by `run`.

### Usage

Import the run function

```typescript
import { run } from "gbye";
```

Pass an `operation` and `channels` to `run`. The operation is passed a `Gbye` object with two methods: `exit` and `trap`. Use `exit` to terminate the operation (think throw) via the specified channel (think catch).

```typescript
run(
  // operation
  (gbye) => {
    gbye.exit("done");
  },
  // channels
  {
    done: () => console.log("Done"),
  }
);
// logs: "Done"
```

A more useful example: terminating an operation conditionally.

```typescript
run(
  // operation
  (gbye) => {
    if (!confirm("Do something?")) {
      gbye.exit("abort");
    }
    console.log("Completed");
  },
  // channels
  {
    abort: () => console.log(`Aborted`),
  }
);
// logs: "Aborted" or "Completed"
```

Terminating an operation with arguments.

```typescript
run(
  // operation
  (gbye) => {
    const password = prompt("Enter your password") || "";
    if (password !== "pa$$word") {
      gbye.exit("wrong", password);
    }
    console.log("Logged in");
  },
  // channels
  {
    wrong: (password: string) => console.log(`Wrong password: ${password}`),
  }
);
// logs: "Logged in" or "Wrong password: ..."
```

Trap exceptions thrown by other functions.

```typescript
run(
  (gbye) => {
    const json = prompt("Enter JSON string") || "";
    const obj = gbye.trap("error", "Parse Error:", () => JSON.parse(json));
    console.log("Object:", obj);
  },
  {
    error: (msg: string, error?: unknown) => console.error(msg, error),
  }
);
// logs: "Object: ..." or "Parse Error: SyntaxError: ..."
```

Define nested operations that use a subset of `channels`.

```typescript
import { run, Gbye } from "gbye";

/**
 * Could terminate via "parse" channel
 */
function getJSON(gbye: Gbye<{ parse: [] }>) {
  const json = prompt("Enter JSON string") || "";
  return gbye.trap("parse", () => JSON.parse(json));
}

/**
 * Could terminate via "invalid" channel
 */
function validate(gbye: Gbye<{ invalid: [string] }>, json: unknown) {
  if (typeof json !== "object") {
    gbye.exit("invalid", "not an object");
  }
}

run(
  // operation
  (gbye) => {
    const json = getJSON(gbye);
    validate(json, gbye);
    console.log("Object:", json);
  },
  // channels
  {
    parse: (error?: unknown) => console.error("Parse Error:", error),
    invalid: (reason: string) => console.error("Invalid JSON:", reason),
  }
);
// logs: "Object: ..." or "Parse Error: SyntaxError: ..." or "Invalid JSON: not an object"
```

### API

WIP: in the meantime check out the source, it's short
