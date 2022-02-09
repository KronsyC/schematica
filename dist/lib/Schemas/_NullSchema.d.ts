import { BaseSchema, BaseSchemaTemplate } from '.';
export interface NullSchemaTemplate extends BaseSchemaTemplate {
    type: "null";
}
export declare class NullSchema extends BaseSchema<NullSchemaTemplate> {
    constructor(template: NullSchemaTemplate);
    validateSchema(): void;
}
