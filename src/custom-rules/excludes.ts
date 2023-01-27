import { addRule } from "../schema-generator";

addRule("array", "excludes", (values: unknown[], matches: unknown | unknown[]) => {
	if (!Array.isArray(matches)) {
		return !values.includes(matches);
	} else {
		return values.length && matches.filter((m) => values.includes(m)).length === 0;
	}
});
//
