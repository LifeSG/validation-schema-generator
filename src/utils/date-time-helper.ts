import { DateTimeFormatter, LocalDate, LocalDateTime, LocalTime, ResolverStyle } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";
import { ERROR_MESSAGES } from "../shared/error-messages";
import { IDaysRangeRule } from "../schema-generator";

export namespace DateTimeHelper {
	// TODO: split into individual functions by type when parsing/formatting gets more complicated
	export const formatDateTime = (
		value: string,
		format: string,
		type: "date" | "time" | "datetime",
		errorMessage?: string
	): string | undefined => {
		if (!value) return undefined;

		try {
			const timeFormatter = DateTimeFormatter.ofPattern(format)
				.withResolverStyle(ResolverStyle.STRICT)
				.withLocale(Locale.ENGLISH);

			switch (type) {
				case "date":
					return LocalDate.parse(value).format(timeFormatter);
				case "time":
					return LocalTime.parse(value).format(timeFormatter);
				case "datetime":
					return LocalDateTime.parse(value).format(timeFormatter);
				default:
					return errorMessage || ERROR_MESSAGES.GENERIC.INVALID;
			}
		} catch (error) {
			return errorMessage || ERROR_MESSAGES.GENERIC.INVALID;
		}
	};

	export function toLocalDateOrTime(value: string, format: string, type: "date"): LocalDate | undefined;
	export function toLocalDateOrTime(value: string, format: string, type: "time"): LocalTime | undefined;
	export function toLocalDateOrTime(value: string, format: string, type: "datetime"): LocalDateTime | undefined;
	export function toLocalDateOrTime(value: string, format: string, type: "date" | "time" | "datetime") {
		if (!value) return undefined;

		try {
			const timeFormatter = DateTimeFormatter.ofPattern(format)
				.withResolverStyle(ResolverStyle.STRICT)
				.withLocale(Locale.ENGLISH);

			switch (type) {
				case "date":
					return LocalDate.parse(value, timeFormatter);
				case "time":
					return LocalTime.parse(value, timeFormatter);
				case "datetime":
					return LocalDateTime.parse(value, timeFormatter);
				default:
					return undefined;
			}
		} catch (error) {
			return undefined;
		}
	}
	export function checkWithinDays(value: string, withinDays: IDaysRangeRule) {
		if (!value) return true;
		const { numberOfDays, fromDate, dateFormat = "uuuu-MM-dd" } = withinDays;
		const selectedDate = toLocalDateOrTime(value, dateFormat, "date");
		if (!selectedDate) return false;
		let startDate: LocalDate;
		let endDate: LocalDate;
		const baseDate = fromDate
			? toLocalDateOrTime(fromDate, dateFormat, "date") || LocalDate.now()
			: LocalDate.now();
		if (numberOfDays >= 0) {
			startDate = baseDate;
			endDate = baseDate.plusDays(numberOfDays);
		} else {
			startDate = baseDate.plusDays(numberOfDays);
			endDate = baseDate;
		}
		return selectedDate.isAfter(startDate) && selectedDate.isBefore(endDate);
	}

	export function checkBeyondDays(value: string, beyondDays: IDaysRangeRule) {
		if (!value) return true;
		const { numberOfDays, fromDate, dateFormat = "uuuu-MM-dd" } = beyondDays;
		const localDate = toLocalDateOrTime(value, dateFormat, "date");
		if (!localDate) return false;

		const baseDate = fromDate
			? toLocalDateOrTime(fromDate, dateFormat, "date") || LocalDate.now()
			: LocalDate.now();
		if (numberOfDays >= 0) {
			return localDate.isBefore(baseDate) || localDate.isAfter(baseDate.plusDays(numberOfDays));
		} else {
			return localDate.isBefore(baseDate.plusDays(numberOfDays)) || localDate.isAfter(baseDate);
		}
	}
}
