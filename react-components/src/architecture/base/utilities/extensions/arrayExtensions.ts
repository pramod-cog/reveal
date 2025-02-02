/*!
 * Copyright 2024 Cognite AS
 */

/*
 * Utility function for missing array methods
 * Use there function in order top increase the readability of your code
 */

export function clear<T>(array: T[]): void {
  array.splice(0, array.length);
}

export function copy<T>(array: T[], from: T[]): void {
  clear(array);
  array.push(...from);
}

export function removeAt<T>(array: T[], index: number): void {
  array.splice(index, 1);
}

export function insert<T>(array: T[], index: number, element: T): void {
  array.splice(index, 0, element);
}

export function replaceLast<T>(array: T[], element: T): void {
  if (array.length >= 1) {
    array[array.length - 1] = element;
  }
}

export function remove<T>(array: T[], element: T): boolean {
  // Return true if changed
  const index = array.indexOf(element);
  if (index < 0) {
    return false;
  }
  removeAt(array, index);
  return true;
}
