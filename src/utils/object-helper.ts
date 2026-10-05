import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import isPlainObject from "lodash/isPlainObject";

export namespace ObjectHelper {
	export const upsert = <T>(data: Record<string, T>, key: string, value: T): Record<string, T> => {
		const updatedData = { ...data };

		if (!(key in updatedData)) {
			updatedData[key] = value;
		} else {
			updatedData[key] = {
				...updatedData[key],
				...value,
			};
		}

		return updatedData;
	};

	interface GetNestedValueByKeyOptions {
		/** whether to skip searching at root level */
		skipRoot?: boolean | undefined;
		/** restrict which nested keys to find in */
		searchIn?: string[] | undefined;
	}
	/**
	 * Returns the first occurrence of the key regardless of the
	 * object hierarchy
	 */
	export const getNestedValueByKey = <T>(
		data: Record<string, T>,
		key: string,
		options: GetNestedValueByKeyOptions = {}
	): Record<string, T> => {
		const { skipRoot, searchIn } = options;
		// use hasOwnProperty instead of `in` so inherited Object.prototype members (e.g. "constructor") aren't mistaken for data
		if (!skipRoot && Object.prototype.hasOwnProperty.call(data, key)) {
			return { [key]: data[key] };
		}

		for (const [parentKey, value] of Object.entries(data)) {
			if (typeof value === "object") {
				if (!searchIn || searchIn.includes(parentKey)) {
					const matches = getNestedValueByKey(value as Record<string, T>, key, {
						...options,
						skipRoot: false,
					});

					if (!isEmpty(matches)) return matches;
				}
			}
		}
	};

	/**
	 * Iteratively checks whether plain objects / arrays nest deeper than maxDepth, without risking stack exhaustion
	 */
	export const exceedsDepth = (data: unknown, maxDepth: number): boolean => {
		const stack: [unknown, number][] = [[data, 0]];
		while (stack.length) {
			const [value, depth] = stack.pop();
			if (!Array.isArray(value) && !isPlainObject(value)) continue;
			if (depth > maxDepth) return true;
			Object.values(value).forEach((child) => stack.push([child, depth + 1]));
		}
		return false;
	};

	/**
	 * removes undefined, null, {}, []
	 */
	export const removeNil = (data: unknown) => {
		if (data === null) {
			return undefined;
		} else if (Array.isArray(data)) {
			const newData = data.map((v) => removeNil(v)).filter((v) => v);
			return newData.length ? newData : undefined;
		} else if (typeof data === "object") {
			const newData = { ...data };
			Object.entries(newData).forEach(([key, value]) => {
				const newValue = removeNil(value);
				if (isNil(newValue)) {
					delete newData[key];
				} else {
					newData[key] = newValue;
				}
			});
			if (!isEmpty(newData)) return newData;
			return undefined;
		}
		return data;
	};
}
