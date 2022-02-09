import { BooleanSchema, BooleanSchemaTemplate, NullSchema, NullSchemaTemplate, NumberSchema, NumberSchemaTemplate, ObjectSchema, ObjectSchemaTemplate, StringSchema, StringSchemaTemplate } from ".";
export declare type GenericSchemaTemplate = StringSchemaTemplate | BooleanSchemaTemplate | ObjectSchemaTemplate | NumberSchemaTemplate | NullSchemaTemplate;
export declare type GenericSchema = StringSchema | BooleanSchema | ObjectSchema | NumberSchema | NullSchema;
export default function createSchema(constructor: GenericSchemaTemplate): GenericSchema;
