import { addRule } from "../schema-generator";

export const includes = () =>
	addRule("array", "includes", (values: unknown[], matches: unknown | unknown[]) => {
		if (!Array.isArray(matches)) {
			return values.includes(matches);
		} else {
			return matches.filter((m) => values.includes(m)).length === matches.length;
		}
	});
