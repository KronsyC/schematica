/**
 * Abstracts away the class constructors to a single function
 */

import {
    AnySchema,
    AnySchemaTemplate,
    ArraySchema,
    ArraySchemaTemplate,
    BooleanSchema,
    BooleanSchemaTemplate,
    NumberSchema,
    NumberSchemaTemplate,
    ObjectSchema,
    ObjectSchemaTemplate,
    Presets,
    StringSchema,
    StringSchemaTemplate,
} from ".";

//TYPEADDITION
export type GenericSchemaTemplate =
    | StringSchemaTemplate
    | BooleanSchemaTemplate
    | ObjectSchemaTemplate
    | NumberSchemaTemplate
    | ArraySchemaTemplate
    | AnySchemaTemplate;

export type GenericSchema =
    | StringSchema
    | BooleanSchema
    | ObjectSchema
    | NumberSchema
    | ArraySchema
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
        case "array":
            return new ArraySchema(constructor, schemaRefStore)
        default:
            throw new Error("Could not find schema for template");
    }
}
export function getPresetByName(name:string){
    switch(name){
        //TYPEADDITION
        case "string":
            return Presets.string
        case "number":
            return Presets.number
            break;
        case "boolean":
            return Presets.boolean
        case "object":
            return Presets.object
        case "any":
            return Presets.any
        default:
            throw new Error(`No preset found for type ${name}`);
    }
}
