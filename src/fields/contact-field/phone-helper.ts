import { CountryCode, parsePhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";
import { CountryData } from "./data";
import { TCountry } from "./types";

interface IParsedPhoneNumber {
	prefix: string;
	number: string;
}

const SINGAPORE_PHONE_NUMBER_REGEX = /^(?!\+?6599)(?!^\+65\d{6}$)^(?:\+?(?:65)?([9,8,6,3]{1}\d{7}))$/;
const SINGAPORE_MOBILE_NUMBER_REGEX = /^(?!\+?6599)(?!^\+65\d{6}$)^(?:\+?(?:65)?([9,8]{1}\d{7}))$/;

export namespace PhoneHelper {
	export const getParsedPhoneNumber = (value: string): IParsedPhoneNumber => {
		const parsedValue = parsePhoneNumberFromString(value);
		if (parsedValue) {
			// Use countryCallingCode (string, without '+')
			return {
				prefix: parsedValue.countryCallingCode || "",
				number: parsedValue.nationalNumber || "",
			};
		}
		// fallback to split for manual input
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
			const isPhoneNumber = SINGAPORE_PHONE_NUMBER_REGEX.test(number);

			if (validateHomeNumber) {
				return isNumberValid && isPhoneNumber && !isMobileNumber;
			}
			return isNumberValid && isPhoneNumber && isMobileNumber;
		} catch (error) {
			return false;
		}
	};

	export const isInternationalNumber = (value: string, countryName?: TCountry): boolean => {
		try {
			const { prefix, number } = getParsedPhoneNumber(value);
			if (!prefix || !number) {
				return false;
			}

			const replacedPrefix = prefix.replace("+", "");

			const countries = CountryData.filter((data) => {
				return countryName
					? data[3] === replacedPrefix && data[0].toLowerCase() === countryName.toLowerCase()
					: data[3] === replacedPrefix;
			});

			if (!countries.length) return false;

			/**
			 * this is not a foolproof way to determine a country by the calling code
			 * because multiple countries can have the same calling code (e.g. USA and Canada both use +1)
			 * hence this is just a simple validation to check if the format matches ANY country
			 */
			return countries.some((country) => {
				const phoneNumber = parsePhoneNumber(number, `${country[2]}`.toUpperCase() as CountryCode);
				return phoneNumber.isValid();
			});
		} catch (error) {
			return false;
		}
	};
}
