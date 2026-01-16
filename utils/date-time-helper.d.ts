import { LocalDate, LocalDateTime, LocalTime } from "@js-joda/core";
import { IDaysRangeRule, IWithinDaysRangeRule } from "../schema-generator";
export declare namespace DateTimeHelper {
    const formatDateTime: (value: string, format: string, type: "date" | "time" | "datetime", errorMessage?: string) => string | undefined;
    function toLocalDateOrTime(value: string, format: string, type: "date"): LocalDate | undefined;
    function toLocalDateOrTime(value: string, format: string, type: "time"): LocalTime | undefined;
    function toLocalDateOrTime(value: string, format: string, type: "datetime"): LocalDateTime | undefined;
    function checkWithinDays(value: string, withinDays: IWithinDaysRangeRule): boolean;
    function calculateWithinDaysRange(withinDays: IDaysRangeRule): {
        startDate: LocalDate;
        endDate: LocalDate;
    };
    function checkBeyondDays(value: string, beyondDays: IDaysRangeRule): boolean;
}
