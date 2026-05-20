import * as Yup from "yup";
import { IFieldSchemaBase, IValidationRule } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { PhoneHelper } from "./contact-field/phone-helper";
import { IFieldGenerator } from "./types";

export type TOtpVerificationType = "phone-number" | "email";

export interface IOtpVerificationFieldValidationRule extends IValidationRule {
	"otp-type": TOtpVerificationType | undefined;
}

export interface IOtpVerificationFieldSchema<V = undefined>
	extends IFieldSchemaBase<"otp-verification-field", V, IOtpVerificationFieldValidationRule> {
	type: TOtpVerificationType;
}

export const otpVerificationField: IFieldGenerator<IOtpVerificationFieldSchema> = (id, { type, validation }) => {
	const otpTypeRule: IOtpVerificationFieldValidationRule = (validation?.find((rule) => rule && "otp-type" in rule) as
		| IOtpVerificationFieldValidationRule
		| undefined) ?? { "otp-type": type };
	const requiredRule = validation?.find((rule) => rule && rule.required);

	let contactSchema = Yup.string();
	if (otpTypeRule["otp-type"] === "email") {
		contactSchema = contactSchema.email(otpTypeRule.errorMessage || ERROR_MESSAGES.EMAIL.INVALID);
	} else if (otpTypeRule["otp-type"] === "phone-number") {
		contactSchema = contactSchema.test(
			"singaporeNumber",
			otpTypeRule.errorMessage || ERROR_MESSAGES.CONTACT.INVALID_SINGAPORE_NUMBER,
			(value) => {
				if (!value) return true;
				return PhoneHelper.isSingaporeNumber(value, true) || PhoneHelper.isSingaporeNumber(value);
			}
		);
	}

	const defaultVerificationError =
		otpTypeRule?.["otp-type"] === "email"
			? ERROR_MESSAGES.OTP_VERIFICATION.EMAIL_VERIFICATION_REQUIRED
			: ERROR_MESSAGES.OTP_VERIFICATION.PHONE_VERIFICATION_REQUIRED;

	return {
		[id]: {
			yupSchema: Yup.object({
				contact: contactSchema,
				type: Yup.string().oneOf([type], `Type must be ${type}`),
				state: Yup.string().oneOf(["default", "sent", "verified"], "Invalid state"),
			}).test("is-otp-verified", requiredRule?.errorMessage || defaultVerificationError, (val) => {
				if (!requiredRule?.required) return true;
				return (val as Record<string, unknown>)?.state === "verified";
			}),
			validation,
		},
	};
};
