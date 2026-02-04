import {
  PathKey,
  PlainObject,
  Container,
  SetInProps,
  HandleArrayObjectProps,
  HandlePlainObjectProps,
  HandleLeafUpdateProps,
} from "./state-utils.types";

function setIn({ obj, path, value }: SetInProps): unknown {
  if (!path.length) {
    return value;
  }

  if (!isContainer(obj)) {
    throw new Error("setIn: obj must be container");
  }

  const [key, ...rest] = path;
  const nextKey = rest[0];

  if (!rest.length) {
    return handleLeafUpdate({ key, obj, value });
  }

  if (Array.isArray(obj)) {
    return handleArrayObject({ key, nextKey, obj, path: rest, value });
  }

  if (isPlainObject(obj)) {
    return handlePlainObject({ key, nextKey, obj, path: rest, value });
  }
}

function getIn(state: unknown, path: PathKey[]): unknown {
  if (!path.length) {
    return state;
  }

  const [key, ...rest] = path;

  if (!isContainer(state)) {
    return undefined;
  }

  if (rest.length === 0) {
    if (isPlainObject(state)) {
      return state[String(key)];
    }

    if (Array.isArray(state)) {
      if (typeof key !== "number") {
        throw new Error(`${key} is an invalid array index.`);
      }

      return state[key];
    }
  }

  if (isPlainObject(state)) {
    const currentChild = state[String(key)];

    return getIn(currentChild, rest);
  }

  if (Array.isArray(state)) {
    if (typeof key !== "number") {
      throw new Error(`${key} is an invalid array index.`);
    }
    const currentChild = state[key];

    return getIn(currentChild, rest);
  }
}

function updateIn({
  state,
  path,
  fn,
}: {
  state: unknown;
  path: PathKey[];
  fn: (curr: unknown) => unknown;
}): unknown {
  if (path.length === 0) {
    return fn(state);
  }

  if (!isContainer(state)) {
    return undefined;
  }

  const currentValue = getIn(state, path);
  const updatedValue = fn(currentValue);

  const updatedState = setIn({ obj: state, path, value: updatedValue });
  return updatedState;
}

function isPlainObject(val: unknown): val is PlainObject {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

function updateArray(arr: Array<unknown>, index: number, value: unknown) {
  return [...arr.slice(0, index), value, ...arr.slice(index + 1)];
}

function isContainer(val: unknown): val is Container {
  return isPlainObject(val) || Array.isArray(val);
}

function handleLeafUpdate(props: HandleLeafUpdateProps) {
  const { key, obj, value } = props;

  if (isPlainObject(obj)) {
    return { ...obj, [key]: value };
  }

  if (Array.isArray(obj)) {
    if (typeof key !== "number") {
      // type guard to ensure key is number for arrays
      throw new Error("Unexpected key type for array");
    }

    return updateArray(obj, key, value);
  }
}

function handleArrayObject(props: HandleArrayObjectProps) {
  const { key, nextKey, obj, path, value } = props;

  if (typeof key !== "number") {
    // type guard to ensure key is number for arrays
    throw new Error("Unexpected key type for array");
  }

  const currentKey = key;
  const currentChild = obj[currentKey];
  const fallbackChild = typeof nextKey === "number" ? [] : {};

  const nextObject = setIn({
    obj: isContainer(currentChild) ? currentChild : fallbackChild,
    path,
    value,
  });
  const result = updateArray(obj, currentKey, nextObject);

  return result;
}

function handlePlainObject(props: HandlePlainObjectProps) {
  const { key, nextKey, obj, path, value } = props;
  const currentKey = String(key);
  const currentChild = obj[currentKey];

  // if NOT array or object, then put it into a container
  // place it into one based on the next key's type
  const childObject = isContainer(currentChild)
    ? currentChild
    : typeof nextKey === "string"
      ? {}
      : [];
  const nextChild = setIn({
    obj: childObject,
    path,
    value,
  });

  return { ...obj, [currentKey]: nextChild };
}

export { setIn, getIn, updateIn };

// const exampleObject = { user: { profile: { name: "G" } }, theme: "dark" };
// const exampleAfterChange = setIn({
//   obj: exampleObject,
//   path: ["user", "profile", "name"],
//   value: "NEW",
// });
// console.log("exampleAfterChange :>> ", JSON.stringify(exampleAfterChange));

// const exampleObject1 = { user: { tags: [1, 2, 3] }, theme: "dark" };
// const exampleAfterChange1 = setIn({
//   obj: exampleObject1,
//   path: ["user", "tags", 1],
//   value: "NEW",
// });
// console.log("exampleAfterChange1 :>> ", JSON.stringify(exampleAfterChange1));

// const exampleObject2 = { user: "Gabor" };
// const exampleAfterChange2 = setIn({
//   obj: exampleObject2,
//   path: ["user", "profile", "name"],
//   value: "PISTA",
// });
// console.log("exampleAfterChange2 :>> ", JSON.stringify(exampleAfterChange2));

// const exampleObject3 = {};
// const exampleAfterChange3 = setIn({
//   obj: exampleObject3,
//   path: ["todos", 0, "done"],
//   value: true,
// });
// console.log("exampleAfterChange3 :>> ", JSON.stringify(exampleAfterChange3));

// const exampleObject4 = { todos: [1, "two", 3, "n;gy"], done: false };
// const exampleAfterChange4 = setIn({
//   obj: exampleObject4,
//   path: ["todos", 0, "done"],
//   value: true,
// });
