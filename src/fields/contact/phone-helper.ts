import { CountryCode, parsePhoneNumber } from "libphonenumber-js";
import { CountryData } from "./data";

interface IParsedPhoneNumber {
	prefix: string;
	number: string;
}

const SINGAPORE_MOBILE_NUMBER_REGEX = /^(?!\+?6599)(?!^\+65\d{6}$)^(?:\+?(?:65)?([9,8]{1}\d{7}))$/;

export namespace PhoneHelper {
	export const getParsedPhoneNumber = (value: string): IParsedPhoneNumber => {
		const parsedValues = value.split(" ");
		const hasPrefix = parsedValues.length > 1;

		return {
			prefix: hasPrefix ? parsedValues[0] : "",
			number: hasPrefix ? parsedValues[1] : value,
		};
	};

	export const isSingaporeNumber = (value: string, validateHomeNumber = false): boolean => {
		try {
			const { number } = getParsedPhoneNumber(value);
			const phoneNumber = parsePhoneNumber(value, "SG");
			const isNumberValid = phoneNumber.isValid();
			const isMobileNumber = SINGAPORE_MOBILE_NUMBER_REGEX.test(number);

			if (validateHomeNumber) {
				return isNumberValid && !isMobileNumber;
			}
			return isNumberValid && isMobileNumber;
		} catch (error) {
			return false;
		}
	};

	export const isInternationalNumber = (value: string): boolean => {
		try {
			const { prefix, number } = getParsedPhoneNumber(value);
			if (!prefix || !number) {
				return false;
			}

			let valid = false;
			const countries = CountryData.filter((data) => data[3] === prefix.replace("+", ""));

			/**
			 * this is not a foolproof way to determine a country by the calling code
			 * because multiple countries can have the same calling code (e.g. USA and Canada both use +1)
			 * hence this is just a simple validation to check if the format matches ANY country
			 */
			countries.forEach((country) => {
				const phoneNumber = parsePhoneNumber(number, `${country[2]}`.toUpperCase() as CountryCode);
				if (phoneNumber.isValid()) {
					valid = true;
				}
			});
			return valid;
		} catch (error) {
			return false;
		}
	};
}
