import { DateTimeFormatter, LocalDate, ResolverStyle } from "@js-joda/core";
import * as Yup from "yup";
import { ERROR_MESSAGES } from "../../shared";
import { IFieldGenerator } from "../types";
import { IDateSchema } from "./types";

const isValidDate = (value: string): boolean => {
	if (!value || value === ERROR_MESSAGES.DATE.INVALID) return false;
	try {
		LocalDate.parse(value, DateTimeFormatter.ofPattern("uuuu-MM-dd").withResolverStyle(ResolverStyle.STRICT));
		return true;
	} catch (error) {
		return false;
	}
};

export const date: IFieldGenerator<IDateSchema> = (id, { validation }) => {
	const futureRule = validation?.find((rule) => "future" in rule);
	const pastRule = validation?.find((rule) => "past" in rule);
	const notFutureRule = validation?.find((rule) => "notFuture" in rule);
	const notPastRule = validation?.find((rule) => "notPast" in rule);

	return {
		[id]: {
			yupSchema: Yup.string()
				.test("is-date", "Invalid date", (value) => {
					if (!value || value === "") return true;
					return isValidDate(value);
				})
				.test("future", futureRule?.["errorMessage"] || ERROR_MESSAGES.DATE.MUST_BE_FUTURE, (value) => {
					if (!isValidDate(value) || !futureRule?.["future"]) return true;
					return LocalDate.parse(value).isAfter(LocalDate.now());
				})
				.test("past", pastRule?.["errorMessage"] || ERROR_MESSAGES.DATE.MUST_BE_PAST, (value) => {
					if (!isValidDate(value) || !pastRule?.["past"]) return true;
					return LocalDate.parse(value).isBefore(LocalDate.now());
				})
				.test(
					"not-future",
					notFutureRule?.["errorMessage"] || ERROR_MESSAGES.DATE.CANNOT_BE_FUTURE,
					(value) => {
						if (!isValidDate(value) || !notFutureRule?.["notFuture"]) return true;
						return !LocalDate.parse(value).isAfter(LocalDate.now());
					}
				)
				.test("not-past", notPastRule?.["errorMessage"] || ERROR_MESSAGES.DATE.CANNOT_BE_PAST, (value) => {
					if (!isValidDate(value) || !notPastRule?.["notPast"]) return true;
					return !LocalDate.parse(value).isBefore(LocalDate.now());
				}),
			validation,
		},
	};
};
