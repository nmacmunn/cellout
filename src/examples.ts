// 1. want to be able to look at code and know what will throw
// 2. want to know what has been thrown, otherwise it's like every fn returning unknown
// 3. send should require a specific type
// 4. trap should

import { run } from ".";

// export type Send<D> = (...args: SendArgs<D>) => never;

// EXAMPLES

/**
 * Here is a simple function that receives some text that is expected to
 * contain a JSON representation of a Person.
 */

interface Person {
  age: number;
}

function parsePerson(text: string): Person {
  const json = JSON.parse(text);
  if (typeof json.age !== "number") {
    throw new Error("age must be a number");
  }
  return json;
}

/**
 * Problem 1: The type signature does not communicate that this function could
 * throw.
 */
const p1 = parsePerson('{"age":"10"}');
// throws Error("age must be a number");
p1.age;

/**
 * Solution: Return instead of throwing
 */
function parsePerson2(text: string): Person | Error {
  const json = JSON.parse(text);
  if (typeof json.age !== "number") {
    return new Error("age must be a number");
  }
  return json;
}

/**
 * Now if we try to use the function, the type checker will force us to
 * check the return value. We can no longer ignore the failure outcome.
 */
const p2 = parsePerson2('{"age":10}');
if (p2 instanceof Error) {
  // do something
} else {
  p2.age;
}

/**
 * Problem 2: We still aren't aware of the error handling state of functions
 * we didn't write.
 */
const p3 = parsePerson2('{"age":10');
// throws parse error

/**
 * Solution: install a global handler and treat unhandled exceptions as bugs
 */
addEventListener("error", (err) => console.error("this is a bug", err));
// process.on("uncaughtException", (err) => console.error("this is a bug", err));

/**
 * When an unhandled exception is brought to our attention, we can simply
 * wrap it.
 */
function parsePerson3(text: string): Person | Error {
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    return e instanceof Error ? e : new Error(`${e}`);
  }
  if (typeof json.age !== "number") {
    return new Error("age must be a number");
  }
  if (json.age < 0) {
    return new Error("age must be 0 or greater");
  }
  return json;
}

// problem: we don't know the type of e

// problem: try-catch is cumbersome

// problem: can't differentiate error types

// problem: propagating errors is annoying
//


