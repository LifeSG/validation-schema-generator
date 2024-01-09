import { IFieldSchemaBase } from "../../schema-generator";

export interface BaseOptionProps {
	label: string;
	key: string;
}
interface IBaseOptionPropsWithValues extends BaseOptionProps {
	value: string;
	subItems?: never;
}

interface IBaseOptionPropsWithSubItems<T> extends BaseOptionProps {
	value?: never;
	subItems: T | undefined;
}

export type TNestedValues = IL1Value | IL2Value | IL3Value;
export interface IL1Value {
	[key: string]: IL2Value | string;
}
export interface IL2Value {
	[key: string]: IL3Value | string;
}
export interface IL3Value {
	[key: string]: string;
}
export type TL1OptionProps = IBaseOptionPropsWithValues | IBaseOptionPropsWithSubItems<TL2OptionProps[]>;
export type TL2OptionProps = IBaseOptionPropsWithValues | IBaseOptionPropsWithSubItems<TL3OptionProps[]>;
export type TL3OptionProps = IBaseOptionPropsWithValues;

export interface INestedMultiSelectSchema<V = undefined> extends IFieldSchemaBase<"nested-multi-select", V> {
	options: TL1OptionProps[];
}
