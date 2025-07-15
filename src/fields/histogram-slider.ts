import isNil from "lodash/isNil";
import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

export interface IHistogramBin {
	count: number;
	minValue: number;
}

export interface IHistogramSlider<V = undefined> extends IFieldSchemaBase<"histogram-slider", V> {
	bins: IHistogramBin[];
	interval: number;
}

export const histogramSlider: IFieldGenerator<IHistogramSlider> = (id, { bins, interval, validation }) => {
	const isRequiredRule = validation?.find((rule) => "required" in rule);

	return {
		[id]: {
			yupSchema: Yup.object({
				from: Yup.number(),
				to: Yup.number(),
			})
				.test(
					"is-required",
					isRequiredRule?.["errorMessage"] || ERROR_MESSAGES.COMMON.REQUIRED_OPTIONS,
					(value) => {
						if (!value || !isRequiredRule?.required) return true;
						return !isNil(value.from) && !isNil(value.to);
					}
				)
				.test("is-bin", ERROR_MESSAGES.SLIDER.MUST_BE_INCREMENTAL, (value) => {
					if (!value || typeof value.from !== "number" || typeof value.to !== "number") return true;

					const { from, to } = value;

					const min = Math.min(...bins.map((bin) => bin.minValue));
					const max = Math.max(...bins.map((bin) => bin.minValue)) + interval;

					if (from >= to || from < min || to > max) {
						return false;
					}

					return Number.isInteger((from - min) / interval) && Number.isInteger((to - min) / interval);
				}),
			validation,
		},
	};
};
