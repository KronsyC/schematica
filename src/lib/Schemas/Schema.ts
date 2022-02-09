/**
 * Abstracts away the class constructors to a single function
 */

import { BooleanSchema, BooleanSchemaTemplate, NullSchema, NullSchemaTemplate, NumberSchema, NumberSchemaTemplate, ObjectSchema, ObjectSchemaTemplate, StringSchema, StringSchemaTemplate } from "."

export type GenericSchemaTemplate = StringSchemaTemplate | BooleanSchemaTemplate | ObjectSchemaTemplate | NumberSchemaTemplate | NullSchemaTemplate
export type GenericSchema = StringSchema | BooleanSchema | ObjectSchema | NumberSchema | NullSchema
export default function createSchema(constructor: GenericSchemaTemplate, schemaRefStore:Map<string, GenericSchema>=new Map()) : GenericSchema{
    switch(constructor.type){
        case "string":
            return new StringSchema(constructor)
        case "boolean":
            return new BooleanSchema(constructor)
        case "number":
            return new NumberSchema(constructor)
        case "object":
            return new ObjectSchema(constructor, schemaRefStore)
        case "null":
            return new NullSchema(constructor)

    }
}