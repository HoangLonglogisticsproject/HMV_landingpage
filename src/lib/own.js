// Lookups by a name that comes from outside (a URL segment, a request field, a message detail) in a table of known names.
// `table[name]` also finds what every object inherits (`constructor`, `toString`, `__proto__`), and `Object.hasOwn(table, name)`
// turns a non-string into a key (['kg'] is 'kg', and {toString: 1} throws): a name counts only when it is a string the table
// itself holds.
export const hasOwn = (table, name) => typeof name === 'string' && table != null && Object.hasOwn(table, name);
/** The table's own entry for the name, `undefined` otherwise. */
export const own = (table, name) => (hasOwn(table, name) ? table[name] : undefined);
