export namespace TestHelper {
	export const getError = (fn: () => unknown) => {
		try {
			return fn();
		} catch (error) {
			return error;
		}
	};

	export const getAsyncError = async (fn: () => unknown) => {
		try {
			return await fn();
		} catch (error) {
			return error;
		}
	};
}
