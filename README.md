# gbye

TypeScript library combining the convenience of `throw` with the type safety of return codes.

### Installation

```sh
npm install --save gbye
```

### Overview

The main function `run` receives an `operation`, wraps it in a `try-catch`, and passes it a `gbye` function. The second argument to `run` is a `handler` handles typesafe exceptions for `operation`. Invoking `gbye` with the parameter type expected by `handler`, immediately terminates `operation` and invokes `handler`. `run` returns the result of `operation` on success, or else the result of `handler`. Exceptions throw without a `gbye` are considered impolite and not be caught by `run`.

### Usage

Import the run function

```typescript
import { run } from "gbye";
```

Pass an `operation` and `channels` to `run`. The operation is passed a `Gbye` object with two methods: `exit` and `trap`. Use `exit` to terminate the operation (think throw) via the specified channel (think catch).

```typescript
run(
  // operation
  (gbye) => gbye("Done"),
  // handler
  (reason: string) = > console.log(reason)
);
// logs: "Done"
```

A more useful example: terminating an operation conditionally.

```typescript
run(
  // operation
  (gbye) => {
    if (!confirm("Do something?")) {
      gbye("Aborted");
    }
    console.log("Completed");
  },
  // handler
  (reason: string) => console.error(reason)
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
      gbye({
        reason: "Wrong password",
        data: password,
      });
    }
    console.log("Logged in");
  },
  // handler
  (err: { reason: string; data: string }) => {
    console.error(`${err.reason}: ${e.data}`);
  }
);
// logs: "Logged in" or "Wrong password: ..."
```

Trap exceptions thrown by other functions.

```typescript
import { run, trap } from "gbye";

run(
  // operation
  (gbye) => {
    const json = prompt("Enter JSON string") || "";
    const obj = trap(gbye, () => JSON.parse(json), "Parse Error");
    console.log("Object:", obj);
  },
  // handler
  (reason: string, error?: unknown) => console.error(`${Reason}:`, error)
);
// logs: "Object: ..." or "Parse Error: SyntaxError: ..."
```

Define nested operations.

```typescript
import { run, trap, Gbye } from "gbye";

type ParseFail = {
  type: "parse";
};

type ValidationFail = {
  type: "validation";
  detail: string;
};

/**
 * Could terminate via "parse" channel
 */
function getJSON(gbye: Gbye<ParseFail>) {
  const json = prompt("Enter JSON string") || "";
  return trap(gbye, () => JSON.parse(json), { type: "parse" });
}

/**
 * Could terminate via "invalid" channel
 */
function validate(gbye: Gbye<ValidationFail>, json: unknown) {
  if (typeof json !== "object") {
    gbye({ type: "validation", detail: "not an object" });
  }
}

run(
  // operation
  (gbye) => {
    const json = getJSON(gbye);
    validate(gbye, json);
    console.log("Object:", json);
  },
  // handler
  (val: ValidationFail | ParseFail, error?: unknown) => {
    if (val.type === "parse") {
      console.error("Parse Error:", error);
    } else if (val.type === "validation") {
      console.error("Invalid JSON:", val.detail);
    }
  }
);
// logs: "Object: ..." or "Parse Error: SyntaxError: ..." or "Invalid JSON: not an object"
```

### API

WIP: in the meantime check out the source, it's short
