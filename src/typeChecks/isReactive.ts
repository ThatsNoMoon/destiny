import { IReactive } from "../reactive/types/IReactive.js";
import { ReactiveArray, ReactivePrimitive } from "../mod.js";
import { reactiveObjectFlag } from "../reactive/reactiveObject/reactiveObjectFlag.js";

/**
 * Checks if a given value is a reactive value; I.E. an instance of `ReactivePrimitive` or `ReactiveArray`, or a `reactiveObject` which is flagged by the `reacativeObjecetFlag` symbol.
 * 
 * @param input The value to be checked
 */
export function isReactive (
  input: unknown,
): input is IReactive<unknown> {
  return [
    ReactiveArray,
    ReactivePrimitive,
  ].some(constr => input instanceof constr) || (
    input &&
    typeof input === "object" &&
    reactiveObjectFlag in input
  );
}
