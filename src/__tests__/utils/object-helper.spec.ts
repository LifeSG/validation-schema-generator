import { ObjectHelper } from "../../utils";

describe("object-helper", () => {
	describe("getNestedValueByKey", () => {
		it("should be able to get data if key exists", () => {
			const expected = { a: 1 };
			const data = { a: 1, b: 2 };

			const result = ObjectHelper.getNestedValueByKey(data, "a");

			expect(result).toEqual(expected);
		});

		it("should be able to get nested data if key exists", () => {
			const expected = { c: 2 };
			const data = { a: { b: { e: 1 }, d: { c: 2 } } };

			const result = ObjectHelper.getNestedValueByKey(data, "c");

			expect(result).toEqual(expected);
		});

		it("should return empty object if key does not exist", () => {
			const expected = undefined;
			const data = { a: { b: { c: 3 } } };

			const result = ObjectHelper.getNestedValueByKey(data, "d");

			expect(result).toEqual(expected);
		});

		it("should ignore keys at root level if skipRoot = true", () => {
			const expected = { c: 1 };
			const data = { a: { c: 1 }, c: 2 };
			const result = ObjectHelper.getNestedValueByKey(data, "c", { skipRoot: true });

			expect(result).toEqual(expected);
		});

		it("should get data from keys defined in searchIn only", () => {
			const expected = { c: 2 };
			const data = { a: { c: 1 }, b: { c: 2 } };
			const result = ObjectHelper.getNestedValueByKey(data, "c", { searchIn: ["b"] });

			expect(result).toEqual(expected);
		});

		it("should get data from nested keys defined in searchIn only", () => {
			const expected = { d: 2 };
			const data = { a: { d: 1 }, b: { a: { d: 1 }, c: { d: 2 } } };
			const result = ObjectHelper.getNestedValueByKey(data, "d", { searchIn: ["b", "c"] });

			expect(result).toEqual(expected);
		});

		it("should not resolve a key to an inherited Object.prototype member", () => {
			const data = { a: { b: 1 } };

			const result = ObjectHelper.getNestedValueByKey(data, "constructor");

			expect(result).toBeUndefined();
		});

		it("should not resolve a nested key to an inherited Object.prototype member", () => {
			const data = { a: { b: 1 } };

			const result = ObjectHelper.getNestedValueByKey(data, "hasOwnProperty");

			expect(result).toBeUndefined();
		});
	});

	describe("removeNil", () => {
		describe.each`
			type              | value
			${"undefined"}    | ${undefined}
			${"null"}         | ${null}
			${"empty object"} | ${{}}
			${"empty array"}  | ${[]}
		`("$type", ({ type, value }) => {
			it(`should remove key if it is ${type}`, () => {
				const expected = { a: 1 };
				const data = { a: 1, b: value };
				const result = ObjectHelper.removeNil(data);

				expect(result).toEqual(expected);
			});

			it(`should remove nested key if it is ${type}`, () => {
				const expected = { a: 1, b: { c: 2 } };
				const data = { a: 1, b: { c: 2, d: value, e: { f: value } } };
				const result = ObjectHelper.removeNil(data);

				expect(result).toEqual(expected);
			});

			it(`should remove value in array if it is ${type}`, () => {
				const expected = { a: 1, b: [2] };
				const data = { a: 1, b: [2, value], c: [value] };
				const result = ObjectHelper.removeNil(data);

				expect(result).toEqual(expected);
			});
		});
	});

	describe("exceedsDepth", () => {
		const nest = (levels: number) => {
			let data: Record<string, unknown> = { leaf: 1 };
			for (let i = 0; i < levels; i++) data = { a: [data] };
			return data;
		};

		it("should return false if nesting is within the max depth", () => {
			expect(ObjectHelper.exceedsDepth(nest(5), 10)).toBe(false);
		});

		it("should return true if nesting exceeds the max depth", () => {
			expect(ObjectHelper.exceedsDepth(nest(6), 10)).toBe(true);
		});

		it("should not exceed the call stack on extremely deep data", () => {
			expect(ObjectHelper.exceedsDepth(nest(100000), 10)).toBe(true);
		});

		it("should terminate on circular references", () => {
			const data: Record<string, unknown> = {};
			data.self = data;
			expect(ObjectHelper.exceedsDepth(data, 10)).toBe(true);
		});

		it.each`
			type           | value
			${"undefined"} | ${undefined}
			${"null"}      | ${null}
			${"primitive"} | ${"string"}
		`("should return false for $type", ({ value }) => {
			expect(ObjectHelper.exceedsDepth(value, 0)).toBe(false);
		});
	});
});
