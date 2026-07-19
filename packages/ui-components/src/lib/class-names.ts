type ClassKey<T> = (keyof T & string) | (string & Record<never, never>);

type ClassMap<T> = Partial<Record<ClassKey<T>, boolean | null | undefined>>;

type ClassArg<T> = ClassKey<T> | ClassMap<T> | false | null | undefined;

/**
 * Joins classes for an element styled with a CSS Modules import. Each entry
 * is either:
 * - a key of `styles` or a raw class name (e.g. a caller-supplied `className`
 *   prop, not part of that module) — falsy entries are dropped, so
 *   conditional classes work directly:
 *   ```ts
 *   classNames(styles, 'c-button', `m-${variant}`, className)
 *   ```
 * - a `{ 'm-name': condition }` map, for two or more modifiers that can
 *   apply independently rather than one variant picking a single class:
 *   ```ts
 *   classNames(styles, 'c-button', { 'm-primary': isPrimary, 'm-loading': isLoading })
 *   ```
 *
 * `keyof T & string` keeps autocomplete/type-checking for real keys of
 * `styles`, while `string & {}` (a no-op intersection) stops TypeScript from
 * widening that union down to plain `string` — so passing a typo'd key
 * still gets caught, but arbitrary external class names are still allowed.
 */
export function classNames<T extends Record<string, string>>(
  styles: T,
  ...classes: ClassArg<T>[]
): string {
  const resolved: string[] = [];

  for (const entry of classes) {
    if (typeof entry === 'string' && entry.length > 0) {
      resolved.push(styles[entry] ?? entry);
      continue;
    }

    if (entry && typeof entry === 'object') {
      for (const [key, enabled] of Object.entries(entry)) {
        if (enabled) {
          resolved.push(styles[key] ?? key);
        }
      }
    }
  }

  return resolved.join(' ');
}
