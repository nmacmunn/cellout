# gbye

Checked exceptions for TypeScript

## quickstart

### installation

```sh
    npm install --save gbye
```

### example

```typescript
import { run } from "gbye";

/**
 * Return the integer representation of `text` or show an alert and return 0
 * if its invalid.
 */
function onChangeNumber(text: string): number {
  return run(
    ({ exit, trap }) => {
      // exit via `parse` if parseInt throws
      const num = trap("parse", text, () => parseInt(text));
      // exit via `number` if num is not finite
      if (!isFinite(num)) {
        throw exit("number", num, "is not finite");
      }
      return num;
    },
    // error handlers
    {
      number: (num: number, msg: string) => {
        alert(`number ${msg}: got ${num}`);
        return 0;
      },
      parse: (text: string, e: unknown) => {
        const message = e instanceof Error ? e.message : e;
        alert(`error parsing ${text}: ${message}`);
        return 0;
      },
    }
  );
}
```

## background

### motivation

typescript has no exception awareness

you can't tell whether a function might throw

if it does, you can't tell what was thrown

this means you have to wrap every function that could throw, an interrogate every exception variable

When something goes wrong you have a choice: recover or don't.

If you're unable to recover, this library can't help you. Otherwise, you have another choice: recover here or recover elsewhere.

If you're able to recover here, that's great, this library can't help you. Otherwise, you need to transfer control and ideally some information about what went wrong to the error handling code.

The easiest way is to `throw` and `catch` somewhere up the stack but there is a problem: TypeScript has little exception awareness. It's impossible to tell from a function signature whether it might throw. Additionally, there's no way to know what might have been throw in a catch handler.

For the conscientious developer, this means wrapping anything that could throw in a try-catch block to simplify error handling. Since this renders horrifically unreadable code, it's natural to conclude that `throw` is best avoided.

1. In TypeScript, function signatures have no way to indicate that the function could throw.

So you cannot trust your dependencies.

2. The exception argument to the catch block has type `unknown`

So the only exception context you have at compile time is where it was caught. Given this lack of context, the closer you are to the exception source the more likely it is to be actionable so you are incentivized to wrap ever call site with `try-catch`, negating it's convenience.

Another way to handle errors is to return them in some form of result object. This offers a the potential for a high degree of actionability far from the call site at the cost of a lot of handling.

### goals

1. to be able to tell where execution might terminate at a glance

2. to maximize available context for dealing with the issue

3. to know at compile time whether an error is unhandled

### alternatives

What else is available?

## usage

#### run

Module-level function that creates a container for an operation and set of error handlers. The operation receives a set of controls faciliting type-safe exceptions.

Accepts an `operation` to execute and `exits` to handle exceptions.

`operation` receives `controls` as its sole argument

```typescript
import { run } from "gbye";
```
