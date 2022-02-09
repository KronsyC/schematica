import { BaseSchema, BaseSchemaTemplate } from '.';
export interface NumberSchemaTemplate extends BaseSchemaTemplate {
    type: "number";
    min?: number;
    max?: number;
}
export declare class NumberSchema extends BaseSchema<NumberSchemaTemplate> {
    min: number;
    max: number;
    constructor(template: NumberSchemaTemplate);
    validateSchema(): void;
}
