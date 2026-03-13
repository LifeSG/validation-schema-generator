import { TCountry } from "./types";
interface IParsedPhoneNumber {
    prefix: string;
    number: string;
}
export declare namespace PhoneHelper {
    const getParsedPhoneNumber: (value: string) => IParsedPhoneNumber;
    const isSingaporeNumber: (value: string, validateHomeNumber?: boolean) => boolean;
    const isInternationalNumber: (value: string, countryName?: TCountry) => boolean;
}
export {};
