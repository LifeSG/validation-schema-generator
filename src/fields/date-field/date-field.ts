import { DateTimeFormatter, LocalDate, ResolverStyle } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";
import * as Yup from "yup";
import { ERROR_MESSAGES } from "../../shared";
import { IFieldGenerator } from "../types";
import { IDateFieldSchema } from "./types";

const isValidDate = (value: string, formatter: DateTimeFormatter): boolean => {
	if (!value || value === ERROR_MESSAGES.DATE.INVALID) return false;
	try {
		LocalDate.parse(value, formatter);
		return true;
	} catch (error) {
		return false;
	}
};

export const dateField: IFieldGenerator<IDateFieldSchema> = (id, { dateFormat = "uuuu-MM-dd", validation }) => {
	const dateFormatter = DateTimeFormatter.ofPattern(dateFormat)
		.withResolverStyle(ResolverStyle.STRICT)
		.withLocale(Locale.ENGLISH);
	const errorMessageDateFormatter = DateTimeFormatter.ofPattern("dd/MM/uuuu")
		.withResolverStyle(ResolverStyle.STRICT)
		.withLocale(Locale.ENGLISH);
	const futureRule = validation?.find((rule) => "future" in rule);
	const pastRule = validation?.find((rule) => "past" in rule);
	const notFutureRule = validation?.find((rule) => "notFuture" in rule);
	const notPastRule = validation?.find((rule) => "notPast" in rule);
	const minDateRule = validation?.find((rule) => "minDate" in rule);
	const maxDateRule = validation?.find((rule) => "maxDate" in rule);
	const excludedDatesRule = validation?.find((rule) => "excludedDates" in rule);

	let minDate: LocalDate;
	let maxDate: LocalDate;
	try {
		minDate = LocalDate.parse(minDateRule?.["minDate"], dateFormatter);
	} catch (error) {}
	try {
		maxDate = LocalDate.parse(maxDateRule?.["maxDate"], dateFormatter);
	} catch (error) {}

	return {
		[id]: {
			yupSchema: Yup.string()
				.test("is-date", ERROR_MESSAGES.DATE.INVALID, (value) => {
					if (!value) return true;
					return isValidDate(value, dateFormatter);
				})
				.test("future", futureRule?.errorMessage || ERROR_MESSAGES.DATE.MUST_BE_FUTURE, (value) => {
					if (!isValidDate(value, dateFormatter) || !futureRule?.["future"]) return true;
					return LocalDate.parse(value, dateFormatter).isAfter(LocalDate.now());
				})
				.test("past", pastRule?.errorMessage || ERROR_MESSAGES.DATE.MUST_BE_PAST, (value) => {
					if (!isValidDate(value, dateFormatter) || !pastRule?.["past"]) return true;
					return LocalDate.parse(value, dateFormatter).isBefore(LocalDate.now());
				})
				.test("not-future", notFutureRule?.errorMessage || ERROR_MESSAGES.DATE.CANNOT_BE_FUTURE, (value) => {
					if (!isValidDate(value, dateFormatter) || !notFutureRule?.["notFuture"]) return true;
					return !LocalDate.parse(value, dateFormatter).isAfter(LocalDate.now());
				})
				.test("not-past", notPastRule?.errorMessage || ERROR_MESSAGES.DATE.CANNOT_BE_PAST, (value) => {
					if (!isValidDate(value, dateFormatter) || !notPastRule?.["notPast"]) return true;
					return !LocalDate.parse(value, dateFormatter).isBefore(LocalDate.now());
				})
				.test(
					"min-date",
					minDateRule?.errorMessage ||
						ERROR_MESSAGES.DATE.MIN_DATE(minDate?.format(errorMessageDateFormatter)),
					(value) => {
						if (!isValidDate(value, dateFormatter) || !minDate) return true;
						return !LocalDate.parse(value).isBefore(minDate);
					}
				)
				.test(
					"max-date",
					maxDateRule?.errorMessage ||
						ERROR_MESSAGES.DATE.MAX_DATE(maxDate?.format(errorMessageDateFormatter)),
					(value) => {
						if (!isValidDate(value, dateFormatter) || !maxDate) return true;
						return !LocalDate.parse(value).isAfter(maxDate);
					}
				)
				.test(
					"excluded-dates",
					excludedDatesRule?.errorMessage || ERROR_MESSAGES.DATE.DISABLED_DATES,
					(value) => {
						if (!isValidDate(value, dateFormatter) || !excludedDatesRule) return true;
						return !excludedDatesRule["excludedDates"].includes(value);
					}
				),
			validation,
		},
	};
};
