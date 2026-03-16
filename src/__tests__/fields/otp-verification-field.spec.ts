import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import type { IOtpVerificationFieldSchema } from "../../fields/otp-verification-field";
import { ERROR_MESSAGE, ERROR_MESSAGE_2 } from "../common";

type TOtpType = "email" | "phone-number";

interface IBasicSchemaCase {
	type: TOtpType;
}

interface IPhoneValidationCase {
	contact: string;
	shouldPass: boolean;
}

interface ITypeEnforcementCase {
	type: TOtpType;
	validation: NonNullable<IOtpVerificationFieldSchema["validation"]>;
	rejectedValue: string;
	expectedError: string;
}

interface IFallbackValidationCase {
	type: TOtpType;
	validation: IOtpVerificationFieldSchema["validation"];
	contactPayload: Record<string, unknown>;
	shouldPass: boolean;
	expectedError: string | undefined;
}

interface IRequiredRuleCase {
	type: TOtpType;
	otpType: TOtpType;
	defaultError: string;
}

const getErrorMessage = (fn: () => unknown): string => (TestHelper.getError(fn) as Error).message;

describe("otp-verification-field", () => {
	describe("basic schema generation", () => {
		it.each`
			type
			${"email"}
			${"phone-number"}
		`("should be able to generate a schema for type: $type", ({ type }: IBasicSchemaCase) => {
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
		it("should accept a valid email address with matching type", () => {
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

			expect(() => schema.validateSync({ field: { contact: "john@doe.com", type: "email" } })).not.toThrowError();
		});

		it("should reject a valid email address with mismatched type", () => {
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

			expect(() =>
				schema.validateSync({ field: { contact: "john@doe.com", type: "phone-number" } })
			).toThrowError();
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

			expect(
				getErrorMessage(() => schema.validateSync({ field: { contact: "hello world", type: "email" } }))
			).toBe(ERROR_MESSAGES.EMAIL.INVALID);
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

			expect(
				getErrorMessage(() => schema.validateSync({ field: { contact: "not-an-email", type: "email" } }))
			).toBe(ERROR_MESSAGE);
		});
	});

	describe("otp-type: phone-number", () => {
		it.each`
			scenario                              | contact           | shouldPass
			${"valid mobile number starting (9)"} | ${"+65 91234567"} | ${true}
			${"valid mobile number starting (8)"} | ${"+65 81234567"} | ${true}
			${"valid home number"}                | ${"+65 61234567"} | ${true}
			${"invalid number"}                   | ${"not-a-number"} | ${false}
		`("should handle $scenario", ({ contact, shouldPass }: IPhoneValidationCase) => {
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
				expect(() => schema.validateSync({ field: { contact, type: "phone-number" } })).not.toThrowError();
			} else {
				expect(getErrorMessage(() => schema.validateSync({ field: { contact, type: "phone-number" } }))).toBe(
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

			expect(
				getErrorMessage(() => schema.validateSync({ field: { contact: "not-a-number", type: "phone-number" } }))
			).toBe(ERROR_MESSAGES.CONTACT.INVALID_SINGAPORE_NUMBER);
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

			expect(
				getErrorMessage(() => schema.validateSync({ field: { contact: "not-a-number", type: "phone-number" } }))
			).toBe(ERROR_MESSAGE_2);
		});
	});

	describe("type enforcement", () => {
		it.each`
			scenario                                            | type              | validation                                                       | rejectedValue     | expectedError
			${"reject a valid phone number when type is email"} | ${"email"}        | ${[{ "otp-type": "email" }]}                                     | ${"+65 91234567"} | ${ERROR_MESSAGES.EMAIL.INVALID}
			${"reject a valid email when type is phone-number"} | ${"phone-number"} | ${[{ "otp-type": "phone-number", errorMessage: ERROR_MESSAGE }]} | ${"john@doe.com"} | ${ERROR_MESSAGE}
		`("should $scenario", ({ type, validation, rejectedValue, expectedError }: ITypeEnforcementCase) => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: { uiType: "otp-verification-field", type, validation },
					},
				},
			});

			expect(getErrorMessage(() => schema.validateSync({ field: { contact: rejectedValue, type } }))).toBe(
				expectedError
			);
		});
	});

	describe("no otp-type in validation", () => {
		it.each`
			scenario                                                 | type              | validation              | contactPayload                                                   | shouldPass | expectedError
			${"empty validation array, valid email"}                 | ${"email"}        | ${[]}                   | ${{ contact: "john@doe.com", type: "email" }}                    | ${true}    | ${undefined}
			${"empty validation array, invalid email"}               | ${"email"}        | ${[]}                   | ${{ contact: "not-an-email", type: "email" }}                    | ${false}   | ${ERROR_MESSAGES.EMAIL.INVALID}
			${"empty validation array, valid phone number"}          | ${"phone-number"} | ${[]}                   | ${{ contact: "+65 91234567", type: "phone-number" }}             | ${true}    | ${undefined}
			${"empty validation array, invalid phone number"}        | ${"phone-number"} | ${[]}                   | ${{ contact: "not-a-number", type: "phone-number" }}             | ${false}   | ${ERROR_MESSAGES.CONTACT.INVALID_SINGAPORE_NUMBER}
			${"no validation key, invalid email"}                    | ${"email"}        | ${undefined}            | ${{ contact: "not-an-email", type: "email" }}                    | ${false}   | ${ERROR_MESSAGES.EMAIL.INVALID}
			${"required rule only, invalid email (state: verified)"} | ${"email"}        | ${[{ required: true }]} | ${{ contact: "not-an-email", type: "email", state: "verified" }} | ${false}   | ${ERROR_MESSAGES.EMAIL.INVALID}
		`(
			"should fall back to field type ($scenario)",
			({ type, validation, contactPayload, shouldPass, expectedError }: IFallbackValidationCase) => {
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
					expect(getErrorMessage(() => schema.validateSync({ field: contactPayload }))).toBe(expectedError);
				}
			}
		);
	});

	describe("required rule", () => {
		it.each`
			type              | otpType           | defaultError
			${"email"}        | ${"email"}        | ${ERROR_MESSAGES.OTP_VERIFICATION.EMAIL_VERIFICATION_REQUIRED}
			${"phone-number"} | ${"phone-number"} | ${ERROR_MESSAGES.OTP_VERIFICATION.PHONE_VERIFICATION_REQUIRED}
		`(
			"should reject submission when state is not verified ($type)",
			({ type, otpType, defaultError }: IRequiredRuleCase) => {
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
					getErrorMessage(() => schema.validateSync({ field: { contact: "value", type, state: "sent" } }))
				).toBe(defaultError);
			}
		);

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
				schema.validateSync({ field: { contact: "+65 91234567", type: "phone-number", state: "verified" } })
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
				getErrorMessage(() =>
					schema.validateSync({ field: { contact: "john@doe.com", type: "email", state: "sent" } })
				)
			).toBe(ERROR_MESSAGE);
		});
	});
});
