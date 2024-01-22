import * as Yup from "yup";
import { IFieldSchemaBase } from "../schema-generator";
import { ERROR_MESSAGES } from "../shared";
import { IFieldGenerator } from "./types";

export interface ISliderSchema<V = undefined> extends IFieldSchemaBase<"slider", V> {}

export const slider: IFieldGenerator<ISliderSchema> = (id, { validation }) => {
	const minRule = validation?.find((rule) => "min" in rule);
	const incrementRule = validation?.find((rule) => "increment" in rule);

	return {
		[id]: {
			yupSchema: Yup.number().test(
				"is-incremental",
				incrementRule?.["errorMessage"] || ERROR_MESSAGES.SLIDER.MUST_BE_INCREMENTAL,
				(value) => {
					if (typeof value !== "number" || !incrementRule) return true;
					const step = incrementRule["increment"];
					const min = minRule?.["min"] ?? 0;
					const diff = min - value;
					return Number.isInteger(diff / step);
				}
			),
			validation,
		},
	};
};
