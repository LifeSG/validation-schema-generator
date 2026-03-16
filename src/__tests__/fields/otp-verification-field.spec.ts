import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

describe("otp-verification-field", () => {
	describe("basic schema generation", () => {
		it.each`
			type
			${"email"}
			${"phone-number"}
		`("should be able to generate a schema for type: $type", ({ type }) => {
			expect(() =>
				jsonToSchema({
					section: {
						uiType: "section",
						children: {
							field: { uiType: "otp-verification-field", type },
						},
					},
				})
			).not.toThrowError();
		});
	});

	describe("otp-type: email", () => {
		it("should accept a valid email address", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "otp-verification-field",
							type: "email",
							validation: [{ "otp-type": "email" }],
						},
					},
				},
			});

			expect(() => schema.validateSync({ field: { contact: "john@doe.com" } })).not.toThrowError();
		});

		it("should reject an invalid email address", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "otp-verification-field",
							type: "email",
							validation: [{ "otp-type": "email" }],
						},
					},
				},
			});

			expect(TestHelper.getError(() => schema.validateSync({ field: { contact: "hello world" } })).message).toBe(
				ERROR_MESSAGES.EMAIL.INVALID
			);
		});

		it("should use errorMessage override", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "otp-verification-field",
							type: "email",
							validation: [{ "otp-type": "email", errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			expect(TestHelper.getError(() => schema.validateSync({ field: { contact: "not-an-email" } })).message).toBe(
				ERROR_MESSAGE
			);
		});
	});

	describe("otp-type: phone-number", () => {
		it.each`
			scenario                              | contact           | shouldPass
			${"valid mobile number starting (9)"} | ${"+65 91234567"} | ${true}
			${"valid mobile number starting (8)"} | ${"+65 81234567"} | ${true}
			${"valid home number"}                | ${"+65 61234567"} | ${true}
			${"invalid number"}                   | ${"not-a-number"} | ${false}
		`("should handle $scenario", ({ contact, shouldPass }) => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "otp-verification-field",
							type: "phone-number",
							validation: [{ "otp-type": "phone-number", errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			if (shouldPass) {
				expect(() => schema.validateSync({ field: { contact } })).not.toThrowError();
			} else {
				expect(TestHelper.getError(() => schema.validateSync({ field: { contact } })).message).toBe(
					ERROR_MESSAGE
				);
			}
		});

		it("should use default error message if errorMessage is not specified", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "otp-verification-field",
							type: "phone-number",
							validation: [{ "otp-type": "phone-number" }],
						},
					},
				},
			});

			expect(TestHelper.getError(() => schema.validateSync({ field: { contact: "not-a-number" } })).message).toBe(
				ERROR_MESSAGES.CONTACT.INVALID_SINGAPORE_NUMBER
			);
		});

		it("should use errorMessage override", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "otp-verification-field",
							type: "phone-number",
							validation: [{ "otp-type": "phone-number", errorMessage: ERROR_MESSAGE_2 }],
						},
					},
				},
			});

			expect(TestHelper.getError(() => schema.validateSync({ field: { contact: "not-a-number" } })).message).toBe(
				ERROR_MESSAGE_2
			);
		});
	});

	describe("type enforcement", () => {
		it.each`
			scenario                                            | type              | validation                                                       | rejectedValue     | expectedError
			${"reject a valid phone number when type is email"} | ${"email"}        | ${[{ "otp-type": "email" }]}                                     | ${"+65 91234567"} | ${ERROR_MESSAGES.EMAIL.INVALID}
			${"reject a valid email when type is phone-number"} | ${"phone-number"} | ${[{ "otp-type": "phone-number", errorMessage: ERROR_MESSAGE }]} | ${"john@doe.com"} | ${ERROR_MESSAGE}
		`("should $scenario", ({ type, validation, rejectedValue, expectedError }) => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: { uiType: "otp-verification-field", type, validation },
					},
				},
			});

			expect(TestHelper.getError(() => schema.validateSync({ field: { contact: rejectedValue } })).message).toBe(
				expectedError
			);
		});
	});

	describe("no otp-type in validation", () => {
		it.each`
			scenario                                                 | type              | validation              | contactPayload                                    | shouldPass | expectedError
			${"empty validation array, valid email"}                 | ${"email"}        | ${[]}                   | ${{ contact: "john@doe.com" }}                    | ${true}    | ${undefined}
			${"empty validation array, invalid email"}               | ${"email"}        | ${[]}                   | ${{ contact: "not-an-email" }}                    | ${false}   | ${ERROR_MESSAGES.EMAIL.INVALID}
			${"empty validation array, valid phone number"}          | ${"phone-number"} | ${[]}                   | ${{ contact: "+65 91234567" }}                    | ${true}    | ${undefined}
			${"empty validation array, invalid phone number"}        | ${"phone-number"} | ${[]}                   | ${{ contact: "not-a-number" }}                    | ${false}   | ${ERROR_MESSAGES.CONTACT.INVALID_SINGAPORE_NUMBER}
			${"no validation key, invalid email"}                    | ${"email"}        | ${undefined}            | ${{ contact: "not-an-email" }}                    | ${false}   | ${ERROR_MESSAGES.EMAIL.INVALID}
			${"required rule only, invalid email (state: verified)"} | ${"email"}        | ${[{ required: true }]} | ${{ contact: "not-an-email", state: "verified" }} | ${false}   | ${ERROR_MESSAGES.EMAIL.INVALID}
		`(
			"should fall back to field type ($scenario)",
			({ type, validation, contactPayload, shouldPass, expectedError }) => {
				const schema = jsonToSchema({
					section: {
						uiType: "section",
						children: {
							field: {
								uiType: "otp-verification-field",
								type,
								...(validation !== undefined && { validation }),
							},
						},
					},
				});

				if (shouldPass) {
					expect(() => schema.validateSync({ field: contactPayload })).not.toThrowError();
				} else {
					expect(TestHelper.getError(() => schema.validateSync({ field: contactPayload })).message).toBe(
						expectedError
					);
				}
			}
		);
	});

	describe("required rule", () => {
		it.each`
			type              | otpType           | defaultError
			${"email"}        | ${"email"}        | ${ERROR_MESSAGES.OTP_VERIFICATION.EMAIL_VERIFICATION_REQUIRED}
			${"phone-number"} | ${"phone-number"} | ${ERROR_MESSAGES.OTP_VERIFICATION.PHONE_VERIFICATION_REQUIRED}
		`("should reject submission when state is not verified ($type)", ({ type, otpType, defaultError }) => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "otp-verification-field",
							type,
							validation: [{ "otp-type": otpType }, { required: true }],
						},
					},
				},
			});

			expect(
				TestHelper.getError(() => schema.validateSync({ field: { contact: "value", state: "sent" } })).message
			).toBe(defaultError);
		});

		it("should pass when state is verified", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "otp-verification-field",
							type: "phone-number",
							validation: [{ "otp-type": "phone-number" }, { required: true }],
						},
					},
				},
			});

			expect(() =>
				schema.validateSync({ field: { contact: "+65 91234567", state: "verified" } })
			).not.toThrowError();
		});

		it("should use errorMessage override from the required rule", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "otp-verification-field",
							type: "email",
							validation: [{ "otp-type": "email" }, { required: true, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			expect(
				TestHelper.getError(() => schema.validateSync({ field: { contact: "john@doe.com", state: "sent" } }))
					.message
			).toBe(ERROR_MESSAGE);
		});
	});
});
