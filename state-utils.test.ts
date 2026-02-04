import { setIn, getIn, updateIn } from "./state-utils";

describe("setIn", () => {
  it("updates object leaf", () => {
    const state = { a: { b: 1 }, theme: "dark" };

    const next = setIn({ obj: state, path: ["a", "b"], value: 2 }) as any;

    expect(next.a.b).toBe(2);
    expect(next.theme).toBe("dark"); // érték
    expect(next.a).not.toBe(state.a); // ref: changed branch new
    expect(next.theme).toBe(state.theme); // unchanged branch value
  });

  it("updates array leaf", () => {
    const state = { a: { b: [10, 20, 30] }, theme: "dark" };

    const next = setIn({ obj: state, path: ["a", "b", 1], value: 200 }) as any;

    expect(next.a.b[1]).toBe(200);
    expect(next.theme).toBe("dark"); // érték
    expect(next.a).not.toBe(state.a); // ref: changed branch new
    expect(next.theme).toBe(state.theme); // unchanged branch value
    expect(next.a.b).not.toBe(state.a.b); // ref: changed branch new
  });

  it("creates missing path segments", () => {
    const state = { user: "Gabor" };

    const next = setIn({
      obj: state,
      path: ["user", "profile", "name"],
      value: "Pista",
    }) as any;

    expect(next.user.profile.name).toBe("Pista");
    expect(state.user?.profile?.name).toBe(undefined);
    expect(next.user).not.toBe(state.user); // ref: changed branch new
    expect(typeof next.user).toBe("object");
    expect(typeof state.user).toBe("string");
  });

  it("creates missing array path segments", () => {
    const state = { user: { tags: [1, 2, 3] }, theme: "dark" };
    const next = setIn({
      obj: state,
      path: ["user", "tags", 3],
      value: 4,
    }) as any;

    expect(next.user.tags[3]).toBe(4);
    expect(next.user.tags).not.toBe(state.user.tags); // ref: changed branch new
    expect(next.theme).toBe(state.theme); // unchanged branch value
  });

  it("returns 'value' when 'path' is an empty array", () => {
    const state = { user: { tags: [1, 2, 3] }, theme: "dark" };
    const nextProps = {
      obj: state,
      path: [],
      value: 4,
    };
    const next = setIn(nextProps);

    expect(nextProps.path).toHaveLength(0);
    expect(next).toEqual(nextProps.value);
  });

  it("updates state with nested array", () => {
    const state = {
      user: {
        tags: [
          [1, 2],
          [3, 4],
        ],
      },
      theme: "dark",
    };
    const next = setIn({
      obj: state,
      path: ["user", "tags", 0, 1],
      value: "TWO",
    }) as any;

    expect(next.user.tags[0][1]).toBe("TWO");
  });

  it("handles invalid array index", () => {
    const state = {
      user: {
        tags: [1, 2, 3],
      },
      theme: "dark",
    };

    expect(
      () =>
        setIn({
          obj: state,
          path: ["user", "tags", "2" as any],
          value: "whatever",
        }) as any,
    ).toThrow("Unexpected key type for array");
  });
});

describe("getIn", () => {
  it("handles invalid array index", () => {
    const state = {
      user: {
        tags: [1, 2, 3],
      },
      theme: "dark",
    };
    const invalidKey = "invalid-key";

    expect(() => getIn(state, ["user", "tags", invalidKey])).toThrow(
      /invalid array index/,
    );
  });
});

describe("updateIn", () => {
  it("toggles a falsy value", () => {
    const state = {
      user: {
        tags: [1, 2, 3],
      },
      done: false,
    };
    const next = updateIn({ state, path: ["done"], fn: (v) => !v }) as any;

    expect(next).not.toBe(state);
    expect(next.done).not.toBe(state.done);
    expect(state.user).toBe(next.user);
    expect(next.done).toBe(true);
  });
});
