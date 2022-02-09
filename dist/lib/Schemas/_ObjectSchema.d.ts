import { BaseSchema, BaseSchemaTemplate } from './__BaseSchema';
import { GenericSchema, GenericSchemaTemplate } from './Schema';
export interface ObjectSchemaTemplate extends BaseSchemaTemplate {
    type: "object";
    additionalProperties?: boolean;
    required?: string[];
    properties: {
        [x: string]: GenericSchemaTemplate;
    };
}
export declare class ObjectSchema extends BaseSchema<ObjectSchemaTemplate> {
    additionalProperties: boolean;
    required: string[];
    properties: Map<string, GenericSchema>;
    constructor(template: ObjectSchemaTemplate);
    validateSchema(): void;
}
