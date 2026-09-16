export namespace RegexHelper {
	/**
	 * Compiles a "matches"/"notMatches" rule pattern string into a RegExp.
	 * Accepts either a delimited `/pattern/flags` form or a bare pattern string.
	 * @returns the compiled RegExp, or undefined (with a logged error) if the config is not a valid pattern
	 */
	export const compile = (pattern: string): RegExp | undefined => {
		const parsed = pattern.match(/^\/(.*)\/([a-z]*)$/);
		try {
			return parsed ? new RegExp(parsed[1], parsed[2]) : new RegExp(pattern);
		} catch (error) {
			console.error(`invalid regex pattern: ${pattern}`);
			return undefined;
		}
	};
}
