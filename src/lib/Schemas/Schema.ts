import { AnySchema, AnySchemaTemplate } from './_AnySchema';
/**
 * Abstracts away the class constructors to a single function
 */

import {
    BooleanSchema,
    BooleanSchemaTemplate,
    NumberSchema,
    NumberSchemaTemplate,
    ObjectSchema,
    ObjectSchemaTemplate,
    StringSchema,
    StringSchemaTemplate,
} from ".";

//TYPEADDITION
export type GenericSchemaTemplate =
    | StringSchemaTemplate
    | BooleanSchemaTemplate
    | ObjectSchemaTemplate
    | NumberSchemaTemplate
    | AnySchemaTemplate;

export type GenericSchema =
    | StringSchema
    | BooleanSchema
    | ObjectSchema
    | NumberSchema
    | AnySchema;
export default function createSchema(
    constructor: GenericSchemaTemplate,
    schemaRefStore: Map<string, GenericSchema> = new Map()
): GenericSchema {
    //TYPEADDITION
    switch (constructor.type) {
        case "any":
            return new AnySchema(constructor);
        case "string":
            return new StringSchema(constructor);
        case "boolean":
            return new BooleanSchema(constructor);
        case "number":
            return new NumberSchema(constructor);
        case "object":
            return new ObjectSchema(constructor, schemaRefStore);

        default:
            throw new Error("Could not find schema for template");
    }
}
