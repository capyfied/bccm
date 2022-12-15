// Helper methods to perform validations.

// Assert that a condition is true by raising an exception if not
export function assert(condition, message) {
  if (!condition) {
    throw new ValidationError(message);
  }
}
// Assert that a property of a hash has a certain type, and (unless required = false) that it's present
export function assertType(hash, key, type, required = true) {
  if (hash[key] == undefined || hash[key] == null) {
    if (!required) return;
    console.log(hash);
    throw new ValidationError(`Attribute is missing: "${key}".`);
  }
  if (typeof(hash[key]) != type) {
    console.log(hash);
    throw new ValidationError(`Error on attribute "${key}": expected ${type} but got ${typeof(hash[key])}`);
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidCraftError";
  }
}
