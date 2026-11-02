import { TimeHelper } from "../../fields/time-field/time-helper";

describe("time-helper", () => {
	describe("validate (12-hour format)", () => {
		it.each(["1:00am", "12:00am", "12:59pm", "9:05PM", "11:30Am", "01:15pm", "10:00pM"])(
			"should accept %s",
			(value) => {
				expect(TimeHelper.validate(value)).toBe(true);
			}
		);

		it.each`
			value                            | reason
			${"0:30am"}                      | ${"hour below 1"}
			${"13:00pm"}                     | ${"hour above 12"}
			${"1:60am"}                      | ${"minutes above 59"}
			${"1:30"}                        | ${"missing period"}
			${"1:30xm"}                      | ${"invalid period"}
			${"1:3am"}                       | ${"single digit minutes"}
			${"1:300am"}                     | ${"three digit minutes"}
			${"1:23:45pm"}                   | ${"extra segment"}
			${"1.23pm"}                      | ${"wrong separator"}
			${""}                            | ${"empty string"}
			${":30am"}                       | ${"empty hour"}
			${"1abc:30am"}                   | ${"trailing text in hour"}
			${"1<img src=x onerror=a>:30am"} | ${"markup in hour"}
			${"0x5:30am"}                    | ${"hex hour"}
			${" 5:30am"}                     | ${"leading space in hour"}
			${"+5:30am"}                     | ${"signed hour"}
			${"1e1:30am"}                    | ${"exponent hour"}
			${"123:30am"}                    | ${"three digit hour"}
			${"1:3.am"}                      | ${"decimal in minutes"}
			${"1:-1am"}                      | ${"negative minutes"}
		`("should reject $value ($reason)", ({ value }) => {
			expect(TimeHelper.validate(value)).toBe(false);
		});
	});

	describe("validate (24-hour format)", () => {
		it.each(["0:00", "00:00", "9:05", "09:05", "12:30", "23:59"])("should accept %s", (value) => {
			expect(TimeHelper.validate(value, true)).toBe(true);
		});

		it.each`
			value             | reason
			${"24:00"}        | ${"hour above 23"}
			${"-1:30"}        | ${"negative hour"}
			${"12:60"}        | ${"minutes above 59"}
			${"12:5x"}        | ${"non-numeric minutes"}
			${"12:30:45"}     | ${"extra segment"}
			${"12.30"}        | ${"wrong separator"}
			${"12:30am"}      | ${"12-hour value in 24-hour mode"}
			${""}             | ${"empty string"}
			${"5<script>:30"} | ${"markup in hour"}
			${"9abc:15"}      | ${"trailing text in hour"}
			${"0x5:30"}       | ${"hex hour"}
			${" 5:30"}        | ${"leading space in hour"}
			${"1e1:30"}       | ${"exponent hour"}
			${"005:30"}       | ${"three digit hour"}
			${"12: 5"}        | ${"space in minutes"}
			${"12:+5"}        | ${"signed minutes"}
		`("should reject $value ($reason)", ({ value }) => {
			expect(TimeHelper.validate(value, true)).toBe(false);
		});

		it("should currently accept single digit minutes", () => {
			// pre-existing behaviour kept deliberately; tightening it is a separate behaviour change
			expect(TimeHelper.validate("9:5", true)).toBe(true);
		});
	});
});
