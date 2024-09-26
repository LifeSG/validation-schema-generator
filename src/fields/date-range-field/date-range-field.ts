import { DateTimeFormatter, LocalDate, ResolverStyle } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";
import * as Yup from "yup";
import { ERROR_MESSAGES } from "../../shared";
import { DateTimeHelper } from "../../utils/date-time-helper";
import { IFieldGenerator } from "../types";
import { IDateRangeFieldSchema } from "./types";

const isValidDate = (value: string, formatter: DateTimeFormatter): boolean => {
	if (!value || value === ERROR_MESSAGES.DATE.INVALID) return false;
	try {
		LocalDate.parse(value, formatter);
		return true;
	} catch (error) {
		return false;
	}
};

export const dateRangeField: IFieldGenerator<IDateRangeFieldSchema> = (
	id,
	{ dateFormat = "uuuu-MM-dd", validation, variant }
) => {
	const dateFormatter = DateTimeFormatter.ofPattern(dateFormat)
		.withResolverStyle(ResolverStyle.STRICT)
		.withLocale(Locale.ENGLISH);
	const futureRule = validation?.find((rule) => "future" in rule);
	const pastRule = validation?.find((rule) => "past" in rule);
	const notFutureRule = validation?.find((rule) => "notFuture" in rule);
	const notPastRule = validation?.find((rule) => "notPast" in rule);
	const minDateRule = validation?.find((rule) => "minDate" in rule);
	const maxDateRule = validation?.find((rule) => "maxDate" in rule);
	const isRequiredRule = validation?.find((rule) => "required" in rule);
	const excludedDatesRule = validation?.find((rule) => "excludedDates" in rule);
	const noOfDaysRule = validation?.find((rule) => "numberOfDays" in rule);

	const minDate = DateTimeHelper.toLocalDateOrTime(minDateRule?.["minDate"], dateFormat, "date");
	const maxDate = DateTimeHelper.toLocalDateOrTime(maxDateRule?.["maxDate"], dateFormat, "date");

	return {
		[id]: {
			yupSchema: Yup.object()
				.shape({
					from: Yup.string(),
					to: Yup.string(),
				})
				.test(
					"is-empty-string",
					isRequiredRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.REQUIRED,
					(value) => {
						if (!value || !isRequiredRule) return true;
						return value.from?.length > 0 && value.to?.length > 0;
					}
				)
				.test("is-date", ERROR_MESSAGES.DATE_RANGE.INVALID, (value) => {
					if (!value || value.from === "" || value.to === "") return true;
					if (value.from === undefined || value.to === undefined) return true;
					if (!isValidDate(value.from, dateFormatter) || !isValidDate(value.to, dateFormatter)) return false;
					return (
						!!DateTimeHelper.toLocalDateOrTime(value.from, dateFormat, "date") ||
						!!DateTimeHelper.toLocalDateOrTime(value.to, dateFormat, "date")
					);
				})
				.test("future", futureRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.MUST_BE_FUTURE, (value) => {
					if (
						!isValidDate(value.from, dateFormatter) ||
						!isValidDate(value.to, dateFormatter) ||
						!futureRule?.["future"]
					)
						return true;
					if (variant === "week") return true;
					const localDateFrom = DateTimeHelper.toLocalDateOrTime(value.from, dateFormat, "date");
					const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to, dateFormat, "date");
					return !!localDateFrom?.isAfter(LocalDate.now()) && !!localDateTo?.isAfter(LocalDate.now());
				})
				.test("past", pastRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.MUST_BE_PAST, (value) => {
					if (
						!isValidDate(value.from, dateFormatter) ||
						!isValidDate(value.to, dateFormatter) ||
						!pastRule?.["past"]
					)
						return true;
					if (variant === "week") return true;
					const localDateFrom = DateTimeHelper.toLocalDateOrTime(value.from, dateFormat, "date");
					const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to, dateFormat, "date");
					return !!localDateFrom?.isBefore(LocalDate.now()) && !!localDateTo?.isBefore(LocalDate.now());
				})
				.test(
					"not-future",
					notFutureRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.CANNOT_BE_FUTURE,
					(value) => {
						if (variant === "week") return true;
						if (
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!notFutureRule?.["notFuture"]
						)
							return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(value.from, dateFormat, "date");
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to, dateFormat, "date");
						return !localDateFrom?.isAfter(LocalDate.now()) && !localDateTo?.isAfter(LocalDate.now());
					}
				)
				.test("not-past", notPastRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.CANNOT_BE_PAST, (value) => {
					if (variant === "week") return true;
					if (
						!isValidDate(value.from, dateFormatter) ||
						!isValidDate(value.to, dateFormatter) ||
						!notPastRule?.["notPast"]
					)
						return true;
					const localDateFrom = DateTimeHelper.toLocalDateOrTime(value.from, dateFormat, "date");
					const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to, dateFormat, "date");
					return !localDateFrom?.isBefore(LocalDate.now()) && !localDateTo?.isBefore(LocalDate.now());
				})
				.test(
					"min-date",
					minDateRule?.errorMessage ||
						ERROR_MESSAGES.DATE_RANGE.MIN_DATE(
							DateTimeHelper.formatDateTime(minDateRule?.["minDate"], "dd/MM/uuuu", "date")
						),
					(value) => {
						if (
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!minDate
						)
							return true;
						if (variant === "week") return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(value.from, dateFormat, "date");
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to, dateFormat, "date");
						return !localDateFrom?.isBefore(minDate) && !localDateTo?.isBefore(minDate);
					}
				)
				.test(
					"max-date",
					maxDateRule?.errorMessage ||
						ERROR_MESSAGES.DATE_RANGE.MAX_DATE(
							DateTimeHelper.formatDateTime(maxDateRule?.["maxDate"], "dd/MM/uuuu", "date")
						),
					(value) => {
						if (
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!maxDate
						)
							return true;
						if (variant === "week") return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(value.from, dateFormat, "date");
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to, dateFormat, "date");
						return !localDateFrom?.isAfter(maxDate) && !localDateTo?.isAfter(maxDate);
					}
				)
				.test(
					"excluded-dates",
					excludedDatesRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.DISABLED_DATES,
					(value) => {
						if (variant === "week") return true;
						if (
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!excludedDatesRule
						)
							return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(value.from, dateFormat, "date");
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to, dateFormat, "date");
						try {
							const mappedexcludedDates = excludedDatesRule["excludedDates"].map((date) =>
								DateTimeHelper.toLocalDateOrTime(date, dateFormat, "date")
							);
							for (const excludedDate of mappedexcludedDates) {
								if (localDateFrom.isEqual(excludedDate) || localDateTo.isEqual(excludedDate))
									return false;
							}
							return true;
						} catch {
							return false;
						}
					}
				)
				.test(
					"number-of-days",
					noOfDaysRule?.errorMessage ||
						ERROR_MESSAGES.DATE_RANGE.MUST_HAVE_NUMBER_OF_DAYS(noOfDaysRule?.["numberOfDays"]),
					(value) => {
						if (variant === "week") return true;
						if (
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!noOfDaysRule?.["numberOfDays"]
						)
							return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(value.from, dateFormat, "date");
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to, dateFormat, "date");
						return localDateTo.equals(localDateFrom.plusDays(noOfDaysRule?.["numberOfDays"] - 1));
					}
				),
			validation,
		},
	};
};
