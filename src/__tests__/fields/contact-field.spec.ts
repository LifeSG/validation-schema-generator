import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

describe("contact-field", () => {
	it("should be able to generate a validation schema", () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "contact-field",
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(() => schema.validateSync({ field: "+65 91234567" })).not.toThrowError();
		expect(TestHelper.getError(() => schema.validateSync({})).message).toBe(ERROR_MESSAGE);
	});

	describe("Singapore numbers", () => {
		it.each`
			scenario                                                                           | type         | valid             | invalid
			${"home numbers by default"}                                                       | ${"default"} | ${"+65 61234567"} | ${"+65 71234567"}
			${'mobile numbers starting with "9" by default'}                                   | ${"default"} | ${"+65 91234567"} | ${"+65 71234567"}
			${'mobile numbers starting with "8" by default'}                                   | ${"default"} | ${"+65 81234567"} | ${"+65 71234567"}
			${'only home numbers if "house" is specified'}                                     | ${"house"}   | ${"+65 61234567"} | ${"+65 91234567"}
			${'mobile numbers starting with "9" and no home numbers if "mobile" is specified'} | ${"mobile"}  | ${"+65 91234567"} | ${"+65 61234567"}
			${'mobile numbers starting with "8" and no home numbers if "mobile" is specified'} | ${"mobile"}  | ${"+65 81234567"} | ${"+65 61234567"}
		`("should accept $scenario", ({ type, valid, invalid }) => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "contact-field",
							somethingUnused: "test",
							validation: [{ contactNumber: { singaporeNumber: type }, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			expect(() => schema.validateSync({ field: valid })).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync({ field: invalid })).message).toBe(ERROR_MESSAGE);
		});

		it("should use default error message if error message is not specified", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "contact-field",
							somethingUnused: "test",
							validation: [{ contactNumber: { singaporeNumber: "default" } }],
						},
					},
				},
			});

			expect(TestHelper.getError(() => schema.validateSync({ field: "invalid" })).message).toBe(
				ERROR_MESSAGES.CONTACT.INVALID_SINGAPORE_NUMBER
			);
		});
	});

	describe("international numbers", () => {
		it("should accept valid numbers", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "contact-field",
							somethingUnused: "test",
							validation: [{ contactNumber: { internationalNumber: true }, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			expect(() => schema.validateSync({ field: "+39 0653980905" })).not.toThrowError();
			expect(() => schema.validateSync({ field: "+44 1624-675663" })).not.toThrowError();
			expect(() => schema.validateSync({ field: "+60 03-9875-9036" })).not.toThrowError();
			expect(() => schema.validateSync({ field: "+61 2-1255-3456" })).not.toThrowError();
			expect(() => schema.validateSync({ field: "+81 97-958-4362" })).not.toThrowError();
			expect(() => schema.validateSync({ field: "+86 131-5558-5558" })).not.toThrowError();
		});

		it("should accept ambiguous calling codes as long as it is valid in a country", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "contact-field",
							somethingUnused: "test",
							validation: [{ contactNumber: { internationalNumber: true }, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			expect(() => schema.validateSync({ field: "+1 212-555-3456" })).not.toThrowError(); // new york, USA
			expect(() => schema.validateSync({ field: "+1 236-555-3456" })).not.toThrowError(); // vancouver, canada
		});

		it("should reject invalid numbers", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "contact-field",
							somethingUnused: "test",
							validation: [{ contactNumber: { internationalNumber: true }, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			expect(TestHelper.getError(() => schema.validateSync({ field: "+2 20-1255-3456" })).message).toBe(
				ERROR_MESSAGE
			); // invalid calling code
			expect(TestHelper.getError(() => schema.validateSync({ field: "+61 1-1255-3456" })).message).toBe(
				ERROR_MESSAGE
			); // invalid area code
			expect(TestHelper.getError(() => schema.validateSync({ field: "+44 20-8759-903" })).message).toBe(
				ERROR_MESSAGE
			); // invalid number
			expect(TestHelper.getError(() => schema.validateSync({ field: "+81 97 958-43623" })).message).toBe(
				ERROR_MESSAGE
			); // invalid spaces
		});

		it("should use default error message if error message is not specified", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "contact-field",
							somethingUnused: "test",
							validation: [{ contactNumber: { internationalNumber: true } }],
						},
					},
				},
			});

			expect(TestHelper.getError(() => schema.validateSync({ field: "+2 20-1255-3456" })).message).toBe(
				ERROR_MESSAGES.CONTACT.INVALID_INTERNATIONAL_NUMBER
			);
		});
	});
});
