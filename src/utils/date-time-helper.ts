import { DateTimeFormatter, LocalDate, LocalDateTime, LocalTime, ResolverStyle } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";
import { ERROR_MESSAGES } from "../shared/error-messages";
import { IDaysRangeRule, IWithinDaysRangeRule } from "../schema-generator";

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
	export function checkWithinDays(value: string, withinDays: IWithinDaysRangeRule) {
		if (!value) return true;
		const { numberOfDays, fromDate, dateFormat = "uuuu-MM-dd", inclusive } = withinDays;
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

		if (numberOfDays >= 0) {
			const actualStart = inclusive ? startDate.minusDays(1) : startDate;
			const actualEnd = endDate.plusDays(1);
			return selectedDate.isAfter(actualStart) && selectedDate.isBefore(actualEnd);
		} else {
			const actualStart = startDate.minusDays(1);
			const actualEnd = inclusive ? endDate.plusDays(1) : endDate;
			return selectedDate.isAfter(actualStart) && selectedDate.isBefore(actualEnd);
		}
	}

	export function calculateWithinDaysRange(withinDays: IDaysRangeRule): {
		startDate: LocalDate;
		endDate: LocalDate;
	} {
		const { numberOfDays, fromDate, dateFormat = "uuuu-MM-dd" } = withinDays;
		const baseDate = fromDate
			? toLocalDateOrTime(fromDate, dateFormat, "date") || LocalDate.now()
			: LocalDate.now();
		if (numberOfDays >= 0) {
			return {
				startDate: baseDate,
				endDate: baseDate.plusDays(numberOfDays),
			};
		} else {
			return {
				startDate: baseDate.plusDays(numberOfDays),
				endDate: baseDate,
			};
		}
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
			return localDate.isAfter(baseDate.plusDays(numberOfDays));
		} else {
			return localDate.isBefore(baseDate.plusDays(numberOfDays));
		}
	}
}
