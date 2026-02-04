# med-to-sen

# Immutable State Toolkit (TypeScript)

This mini toolkit provides immutable helpers to read and update nested state using a `path` (array of keys).
It supports both objects and arrays and uses structural sharing (only the updated branch gets new references).

## Path

A path is an array of keys describing where to read or write.

- Object keys: `string`
- Array indexes: `number`

Examples:

- `["user", "profile", "name"]`
- `["todos", 0, "done"]`
- `[1, 0]` for nested arrays like `[[1,2],[3,4]]`

---

## Functions

### `setIn({ obj, path, value })`

Immutably sets a value at the given path.

**Behavior**

- If `path` is empty (`[]`), the function returns `value` (root replacement).
- If parts of the path don't exist, intermediate containers are created:
  - Next key is `number` -> create `[]`
  - Next key is `string` -> create `{}`

**Array index policy**

- When writing into an array, the current `key` must be a `number`.
  - If not, the function throws an error.

**Structural sharing**

- Only containers along the path are shallow-cloned.
- Unaffected branches keep the same reference.

**Example**

```ts
const state = { user: { profile: { name: "G" } }, theme: "dark" };
const next = setIn({
  obj: state,
  path: ["user", "profile", "name"],
  value: "B",
});

// updated value
next.user.profile.name === "B";

// structural sharing
next !== state; // true
next.user !== state.user; // true (updated branch)
next.theme === state.theme; // true (unchanged branch)
```

### `getIn(state, path)`

- Reads a value at the given path.

**Behavior**

- If path is empty ([]), returns the full state.
- If the path can't be fully resolved (missing key / null / undefined / primitive before end), returns undefined.

**Array index policy**

- When reading from an array, the current key must be a number.
- If not, the function throws an error.

**Example**

```ts
-getIn({ a: { b: 1 } }, ["a", "b"]); // 1
-getIn({ a: null }, ["a", "b"]); // undefined
-getIn([{ x: 1 }], [0, "x"]); // 1
```

### `updateIn({ state, path, fn })`

# Immutably updates a value at the given path by applying a function to the current value.

**Behavior**

- Computes currentValue = getIn(state, path) (may be undefined)
- Computes nextValue = fn(currentValue)
- Writes it back using setIn

**Special case**

- If path is empty ([]), the function returns fn(state) (root update).

**Container policy**

- If path is non-empty and state is not an object/array container, the function returns undefined.

**Examples**

```js
// toggle a boolean
updateIn({
  state: { a: false },
  path: ["a"],
  fn: (x) => !x,
}); // { a: true }

// create missing path
updateIn({
  state: {},
  path: ["user", "age"],
  fn: (x) => ((x ?? 0) as number) + 1,
}); // { user: { age: 1 } }

// root update
updateIn({
  state: 5,
  path: [],
  fn: () => 9,
}); // 9
```

### Notes / Constraints

- No mutation: the original state / obj must never be modified.
- Arrays are cloned with slice() / spread.
- Objects are cloned with { ...obj }.
- Only the updated branch is cloned (structural sharing).
