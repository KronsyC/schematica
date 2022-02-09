import { BaseSchema, BaseSchemaTemplate } from '.';
export interface BooleanSchemaTemplate extends BaseSchemaTemplate {
    type: "boolean";
}
export declare class BooleanSchema extends BaseSchema<BooleanSchemaTemplate> {
    constructor(template: BooleanSchemaTemplate);
    validateSchema(): void;
}
