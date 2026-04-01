import { DateTimeFormatter, LocalDate, ResolverStyle } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";
import isEmpty from "lodash/isEmpty";
import * as Yup from "yup";
import { IValidationRule } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { DateTimeHelper } from "../../utils";
import { IFieldGenerator } from "../types";
import { IDateRangeFieldSchema, IDateRangeInputValidationRule } from "./types";

const isEmptyValue = (value: { from: string | undefined; to: string | undefined }) =>
	!value || !value.from || !value.to;

const isValidDate = (value: string | undefined, formatter: DateTimeFormatter): boolean => {
	if (!value || value === ERROR_MESSAGES.DATE_RANGE.INVALID) return false;
	try {
		LocalDate.parse(value, formatter);
		return true;
	} catch (error) {
		return false;
	}
};

const getAppliedRule = (
	metaRules: (IValidationRule | IDateRangeInputValidationRule)[],
	validation: IDateRangeFieldSchema["validation"],
	key: string
): (IValidationRule & IDateRangeInputValidationRule) | undefined => {
	const metaRule = metaRules?.find((rule) => rule && key in rule);
	const validationRule = validation?.find((rule) => !!rule && key in rule);
	if (!isEmpty(metaRule)) return metaRule as IValidationRule & IDateRangeInputValidationRule;
	if (!isEmpty(validationRule)) return validationRule as IValidationRule & IDateRangeInputValidationRule;
	return undefined;
};

export const dateRangeField: IFieldGenerator<IDateRangeFieldSchema> = (
	id,
	{ dateFormat = "uuuu-MM-dd", validation, variant }
) => {
	const dateFormatter = DateTimeFormatter.ofPattern(dateFormat)
		.withResolverStyle(ResolverStyle.STRICT)
		.withLocale(Locale.ENGLISH);

	return {
		[id]: {
			yupSchema: Yup.object()
				.shape({
					from: Yup.string(),
					to: Yup.string(),
				})
				.test({
					name: "is-empty-string",
					test(value, context) {
						const isRequiredRule = getAppliedRule(
							context.schema.describe().meta?.rules,
							validation,
							"required"
						);
						if (!value || !isRequiredRule || !isRequiredRule.required) return true;
						if (!isEmptyValue(value)) return true;
						return this.createError({
							message: isRequiredRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.REQUIRED,
						});
					},
				})
				.test({
					name: "is-date",
					test(value) {
						const dateFormatRule = validation?.find((rule) => !!rule && "dateFormat" in rule);
						if (isEmptyValue(value)) return true;
						if (!isValidDate(value.from, dateFormatter) || !isValidDate(value.to, dateFormatter)) {
							return this.createError({
								message: dateFormatRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.INVALID,
							});
						}
						const isValid =
							!!DateTimeHelper.toLocalDateOrTime(value.from as string, dateFormat, "date") ||
							!!DateTimeHelper.toLocalDateOrTime(value.to as string, dateFormat, "date");
						if (isValid) return true;
						return this.createError({
							message: dateFormatRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.INVALID,
						});
					},
				})
				.test({
					name: "future",
					test(value, context) {
						if (variant === "week") return true;
						const futureRule = getAppliedRule(context.schema.describe().meta?.rules, validation, "future");
						if (
							isEmptyValue(value) ||
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!futureRule?.["future"]
						)
							return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(
							value.from as string,
							dateFormat,
							"date"
						);
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to as string, dateFormat, "date");
						const isValid =
							!!localDateFrom?.isAfter(LocalDate.now()) && !!localDateTo?.isAfter(LocalDate.now());
						if (isValid) return true;
						return this.createError({
							message: futureRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.MUST_BE_FUTURE,
						});
					},
				})
				.test({
					name: "past",
					test(value, context) {
						if (variant === "week") return true;
						const pastRule = getAppliedRule(context.schema.describe().meta?.rules, validation, "past");
						if (
							isEmptyValue(value) ||
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!pastRule?.["past"]
						)
							return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(
							value.from as string,
							dateFormat,
							"date"
						);
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to as string, dateFormat, "date");
						const isValid =
							!!localDateFrom?.isBefore(LocalDate.now()) && !!localDateTo?.isBefore(LocalDate.now());
						if (isValid) return true;
						return this.createError({
							message: pastRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.MUST_BE_PAST,
						});
					},
				})
				.test({
					name: "not-future",
					test(value, context) {
						if (variant === "week") return true;
						const notFutureRule = getAppliedRule(
							context.schema.describe().meta?.rules,
							validation,
							"notFuture"
						);
						if (
							isEmptyValue(value) ||
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!notFutureRule?.["notFuture"]
						)
							return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(
							value.from as string,
							dateFormat,
							"date"
						);
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to as string, dateFormat, "date");
						const isValid =
							!localDateFrom?.isAfter(LocalDate.now()) && !localDateTo?.isAfter(LocalDate.now());
						if (isValid) return true;
						return this.createError({
							message: notFutureRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.CANNOT_BE_FUTURE,
						});
					},
				})
				.test({
					name: "not-past",
					test(value, context) {
						if (variant === "week") return true;
						const notPastRule = getAppliedRule(
							context.schema.describe().meta?.rules,
							validation,
							"notPast"
						);
						if (
							isEmptyValue(value) ||
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!notPastRule?.["notPast"]
						)
							return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(
							value.from as string,
							dateFormat,
							"date"
						);
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to as string, dateFormat, "date");
						const isValid =
							!localDateFrom?.isBefore(LocalDate.now()) && !localDateTo?.isBefore(LocalDate.now());
						if (isValid) return true;
						return this.createError({
							message: notPastRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.CANNOT_BE_PAST,
						});
					},
				})
				.test({
					name: "min-date",
					test(value, context) {
						if (variant === "week") return true;
						const minDateRule = getAppliedRule(
							context.schema.describe().meta?.rules,
							validation,
							"minDate"
						);
						const effectiveMinDateStr = minDateRule?.["minDate"] as string | undefined;
						if (
							isEmptyValue(value) ||
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!effectiveMinDateStr
						)
							return true;
						const effectiveMinDate = DateTimeHelper.toLocalDateOrTime(
							effectiveMinDateStr,
							dateFormat,
							"date"
						);
						if (!effectiveMinDate) return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(
							value.from as string,
							dateFormat,
							"date"
						);
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to as string, dateFormat, "date");
						const isValid =
							!localDateFrom?.isBefore(effectiveMinDate) && !localDateTo?.isBefore(effectiveMinDate);
						if (isValid) return true;
						return this.createError({
							message:
								minDateRule?.errorMessage ||
								ERROR_MESSAGES.DATE_RANGE.MIN_DATE(
									DateTimeHelper.formatDateTime(effectiveMinDateStr, "dd/MM/uuuu", "date")
								),
						});
					},
				})
				.test({
					name: "max-date",
					test(value, context) {
						if (variant === "week") return true;
						const maxDateRule = getAppliedRule(
							context.schema.describe().meta?.rules,
							validation,
							"maxDate"
						);
						const effectiveMaxDateStr = maxDateRule?.["maxDate"] as string | undefined;
						if (
							isEmptyValue(value) ||
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!effectiveMaxDateStr
						)
							return true;
						const effectiveMaxDate = DateTimeHelper.toLocalDateOrTime(
							effectiveMaxDateStr,
							dateFormat,
							"date"
						);
						if (!effectiveMaxDate) return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(
							value.from as string,
							dateFormat,
							"date"
						);
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to as string, dateFormat, "date");
						const isValid =
							!localDateFrom?.isAfter(effectiveMaxDate) && !localDateTo?.isAfter(effectiveMaxDate);
						if (isValid) return true;
						return this.createError({
							message:
								maxDateRule?.errorMessage ||
								ERROR_MESSAGES.DATE_RANGE.MAX_DATE(
									DateTimeHelper.formatDateTime(effectiveMaxDateStr, "dd/MM/uuuu", "date")
								),
						});
					},
				})
				.test({
					name: "excluded-dates",
					test(value, context) {
						if (variant === "week") return true;
						const excludedDatesRule = getAppliedRule(
							context.schema.describe().meta?.rules,
							validation,
							"excludedDates"
						);
						const effectiveExcludedDates = excludedDatesRule?.["excludedDates"] as string[] | undefined;
						if (
							isEmptyValue(value) ||
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!effectiveExcludedDates
						)
							return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(
							value.from as string,
							dateFormat,
							"date"
						);
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to as string, dateFormat, "date");
						try {
							const mappedexcludedDates = effectiveExcludedDates.map((date) =>
								DateTimeHelper.toLocalDateOrTime(date, dateFormat, "date")
							);
							for (const excludedDate of mappedexcludedDates) {
								if (
									localDateFrom?.isEqual(excludedDate as LocalDate) ||
									localDateTo?.isEqual(excludedDate as LocalDate)
								) {
									return this.createError({
										message:
											excludedDatesRule?.errorMessage || ERROR_MESSAGES.DATE_RANGE.DISABLED_DATES,
									});
								}
							}
							return true;
						} catch {
							return false;
						}
					},
				})
				.test({
					name: "number-of-days",
					test(value, context) {
						if (variant === "week") return true;
						const noOfDaysRule = getAppliedRule(
							context.schema.describe().meta?.rules,
							validation,
							"numberOfDays"
						);
						const effectiveNoOfDays = noOfDaysRule?.["numberOfDays"] as number | undefined;
						if (
							isEmptyValue(value) ||
							!isValidDate(value.from, dateFormatter) ||
							!isValidDate(value.to, dateFormatter) ||
							!effectiveNoOfDays
						)
							return true;
						const localDateFrom = DateTimeHelper.toLocalDateOrTime(
							value.from as string,
							dateFormat,
							"date"
						);
						const localDateTo = DateTimeHelper.toLocalDateOrTime(value.to as string, dateFormat, "date");
						const isValid = localDateTo?.equals(localDateFrom?.plusDays(effectiveNoOfDays - 1));
						if (isValid) return true;
						return this.createError({
							message:
								noOfDaysRule?.errorMessage ||
								ERROR_MESSAGES.DATE_RANGE.MUST_HAVE_NUMBER_OF_DAYS(effectiveNoOfDays),
						});
					},
				}),
			validation,
		},
	};
};
