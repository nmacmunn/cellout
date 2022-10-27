# gbye

Checked exceptions for TypeScript

## quickstart

### installation

```sh
    npm install --save gbye
```

### usage

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
