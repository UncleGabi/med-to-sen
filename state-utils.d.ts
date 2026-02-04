export type PathKey = string | number;
export type Path = readonly PathKey[];
export type PlainObject = Record<string, unknown>;
export type Container = Record<string, unknown> | unknown[];
export type SetInProps = {
  obj: Record<string, unknown> | Array<unknown>;
  path: PathKey[];
  value: unknown;
};

export type KeyProps = {
  key: PathKey;
  nextKey: PathKey;
};

export type HandleArrayObjectProps = KeyProps & {
  obj: Array<unknown>;
  path: PathKey[];
  value: unknown;
};

export type HandlePlainObjectProps = KeyProps & {
  obj: PlainObject;
  path: PathKey[];
  value: unknown;
};

export type HandleLeafUpdateProps = {
  key: PathKey;
  obj: Container;
  value: unknown;
};
