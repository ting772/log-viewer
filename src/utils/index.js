export function getType(o) {
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
}

export function isObject(o) {
  return getType(o) == "object";
}

export function isArray(o) {
  return getType(o) == "array";
}
