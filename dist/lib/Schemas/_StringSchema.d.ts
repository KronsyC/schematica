import { BaseSchema, BaseSchemaTemplate } from '.';
export interface StringSchemaTemplate extends BaseSchemaTemplate {
    type: "string";
    minLength?: number;
    maxLength?: number;
    encoding?: TextEncoding;
    match?: RegExp;
}
export declare type TextEncoding = "ascii" | "utf8" | "unicode";
export declare class StringSchema extends BaseSchema<StringSchemaTemplate> {
    minLength: number;
    maxLength: number;
    encoding: TextEncoding;
    match?: RegExp;
    constructor(template: StringSchemaTemplate);
    validateSchema(): void;
}
