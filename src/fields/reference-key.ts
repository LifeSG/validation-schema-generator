import * as Yup from "yup";

export const referenceKey = (id: string) => ({
	[id]: {
		yupSchema: Yup.mixed().nullable(),
		validation: [],
	},
});
