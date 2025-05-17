// String utility functions that I didn't want to incorporate all of lodash
// to get.

export interface CapitalizeOptions {
  allWords?: boolean;
}

export function capitalize(
  s: string,
  { allWords }: CapitalizeOptions = {},
): string {
  if (allWords) {
    return s
      .split(" ")
      .map((word) => capitalize(word))
      .join(" ");
  } else {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}

export function truncate(
  s: string,
  {
    length = 30,
    omission = "…",
  }: {
    length?: number;
    omission?: string;
  } = {},
): string {
  if (s && s.length > length) {
    return s.substr(0, length - 1).trimEnd() + omission;
  } else {
    return s;
  }
}

export function makePosessive(s: string): string {
  if (s.endsWith("'s") || s.endsWith("’s")) {
    return s; // Roscoe's -> Roscoe's
  } else if (s.endsWith("s")) {
    return s.trimEnd() + "'"; // Bob's Burgers -> Bob's Burgers'
  } else {
    return s.trimEnd() + "'s"; // Enlight -> Enlight's
  }
}

/**
 * For when you want to show a number of items while using the singular
 * form of the item when there is only one.
 */
export function pluralize(
  num: number,
  units: string | [singular: string, plural: string],
  { showZero = false }: { showZero?: boolean } = {},
) {
  const rounded = Math.floor(num);
  const [singular, plural] = Array.isArray(units)
    ? units
    : splitSingularAndPlural(units);
  if (rounded === 0 && !showZero) {
    return "No " + plural;
  } else if (rounded === 1) {
    return `${rounded} ${singular}`;
  } else {
    return `${rounded} ${plural}`;
  }
}

function splitSingularAndPlural(
  phrase: string,
): [singular: string, plural: string] {
  // Split "items were" into ["item was", "items were"]
  if (phrase.endsWith("s were")) {
    return [phrase.slice(0, -6) + " was", phrase];
  }
  // Split "items are" into ["item is", "items are"]
  else if (phrase.endsWith("s are")) {
    return [phrase.slice(0, -5) + " is", phrase];
  }
  // Split "items has" into ["item has", "items have"]
  else if (phrase.endsWith("s has")) {
    return [phrase.slice(0, -5) + " has", phrase];
  }
  // Split "items" into ["item", "items"]
  else if (phrase.endsWith("s")) {
    return [phrase.slice(0, -1), phrase];
  }
  // No change
  else {
    return [phrase, phrase];
  }
}

export function joinWith(
  items: string[],
  { trailing, quotes }: { trailing: string; quotes?: boolean | string },
): string {
  const quote =
    typeof quotes === "string" ? quotes : quotes === true ? '"' : null;

  if (quote) {
    items = items.map((item) => `${quote}${item}${quote}`);
  }

  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${trailing} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${trailing} ${
    items[items.length - 1]
  }`;
}

/**
 * Given a list of "items" like ["Apples", "Bananas", "Oranges"],
 * returns a string like "Apples, Bananas, and Oranges".
 * If there are only two items, returns "Apples and Bananas".
 */
export function joinWithAnd(
  items: string[],
  { quotes }: { quotes?: boolean | string } = {},
): string {
  return joinWith(items, { trailing: "and", quotes });
}

/**
 * Given a list of "items" like ["Apples", "Bananas", "Oranges"],
 * returns a string like "Apples, Bananas, or Oranges".
 * If there are only two items, returns "Apples or Bananas".
 */
export function joinWithOr(
  items: string[],
  { quotes }: { quotes?: boolean | string },
): string {
  return joinWith(items, { trailing: "or", quotes });
}

export function camelCaseToSentence(str: string): string {
  return capitalize(str)
    .replace(/([A-Z])/g, " $1")
    .trim();
}

/**
 * Given a string, typically one with multiple lines, returns a "dedented"
 * trimmed string. The number of spaces of indentation removed is the minimum
 * number of spaces found at the beginning of any line. For example:
 *
 * ```
 * dedent(`
 *  Hello
 *   World
 * `)
 * ```
 *
 * returns:
 *
 * ```Hello
 *  World```
 */
export function dedent(str: string): string {
  const lines = str.split("\n");
  const minIndent = Math.min(
    ...lines
      .filter((line) => line.trim().length > 0)
      .map((line) => line.match(/^ */)?.[0]?.length ?? 0),
  );
  return lines
    .map((line) => line.substring(minIndent))
    .join("\n")
    .trim();
}
