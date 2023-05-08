import * as Yup from "yup";
import { ERROR_MESSAGES } from "../../shared";
import { IFieldGenerator } from "../types";
import { PhoneHelper } from "./phone-helper";
import { IContactFieldSchema } from "./types";

export const contactField: IFieldGenerator<IContactFieldSchema> = (id, { validation }) => {
	const contactNumberRule = validation?.find((rule) => "contactNumber" in rule);
	const singaporeRule = contactNumberRule?.["contactNumber"]?.["singaporeNumber"];
	const fixedCountryName = contactNumberRule?.["contactNumber"]?.["fixedCountry"];
	const errorMessage = contactNumberRule?.["errorMessage"];

	return {
		[id]: {
			yupSchema: Yup.string()
				.test("singaporeNumber", errorMessage || ERROR_MESSAGES.CONTACT.INVALID_SINGAPORE_NUMBER, (value) => {
					if (!value || !singaporeRule) return true;

					switch (singaporeRule) {
						case "default":
							return PhoneHelper.isSingaporeNumber(value, true) || PhoneHelper.isSingaporeNumber(value);
						case "house":
							return PhoneHelper.isSingaporeNumber(value, true);
						case "mobile":
							return PhoneHelper.isSingaporeNumber(value);
						default:
							break;
					}
				})
				.test(
					"internationalNumber",
					errorMessage || ERROR_MESSAGES.CONTACT.INVALID_INTERNATIONAL_NUMBER,
					(value) => {
						if (!value || singaporeRule) return true;
						return PhoneHelper.isInternationalNumber(value, fixedCountryName);
					}
				),
			validation,
		},
	};
};
