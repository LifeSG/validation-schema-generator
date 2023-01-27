export namespace TestHelper {
	export const getError = (fn: () => unknown) => {
		try {
			return fn();
		} catch (error) {
			return error;
		}
	};
}
