import { expect, test } from "vitest";
import { createObject } from "./census";

test("create object default", () => {
    expect(createObject(["test", "of"], [1, 2])).toStrictEqual({ test: 1, of: 2 });
});

test("create object with different length arrays", () => {
    expect(() => createObject(["this", "should", "fail"], [1, 2])).toThrowError("length");
});
