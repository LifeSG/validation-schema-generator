export namespace TimeHelper {
	export const validate = (value: string, is24HourFormat = false) => {
		const timeArr = value.split(":");

		if (!is24HourFormat) {
			// Check format
			if (timeArr.length !== 2 || timeArr[1].length !== 4) return false;

			const minute = timeArr[1].substring(0, 2);
			const period = timeArr[1].substring(2);

			if (!isValidHour(timeArr[0], is24HourFormat) || !isValidMinutes(minute) || !isValidTimePeriod(period)) {
				return false;
			}

			return true;
		} else {
			// Check format
			if (timeArr.length !== 2 || timeArr[1].length === 4) return false;

			if (!isValidHour(timeArr[0], is24HourFormat) || !isValidMinutes(timeArr[1])) {
				return false;
			}

			return true;
		}
	};
}

// =============================================================================
// NON-EXPORTABLES
// =============================================================================
const isValidHour = (hourString: string, is24HourFormat = false): boolean => {
	const numValue = parseInt(hourString);
	return Number(hourString) === numValue && is24HourFormat
		? numValue >= 0 && numValue <= 23
		: numValue >= 1 && numValue <= 12;
};

const isValidMinutes = (minuteString: string): boolean => {
	const numValue = parseInt(minuteString);
	return Number(minuteString) === numValue && numValue >= 0 && numValue <= 59;
};

const isValidTimePeriod = (timePeriodString: string): boolean => {
	return timePeriodString.toLowerCase() === "am" || timePeriodString.toLowerCase() === "pm";
};
