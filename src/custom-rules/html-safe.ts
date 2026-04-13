import isEmpty from "lodash/isEmpty";
import { addRule } from "../schema-generator";

// Myinfo name fields allow letters, spaces, and only these special characters: , ( ) / . @ - '
const HTML_SAFE_REGEX = /^[A-Za-z\s,()/.@'-]+$/;

export const htmlSafe = () =>
	addRule("string", "htmlSafe", (value: string, htmlSafe: boolean) => {
		if (isEmpty(value) || !htmlSafe) return true;
		return HTML_SAFE_REGEX.test(value);
	});
