import NumberSchema, { NumberSchemaTemplate } from './_NumberSchema';
import ObjectSchema, { ObjectSchemaTemplate } from './_ObjectSchema';
import BooleanSchema, { BooleanSchemaTemplate } from './_BooleanSchema';
import StringSchema, { StringSchemaTemplate } from './_StringSchema';
import NullSchema, { NullSchemaTemplate } from './_NullSchema';

/**
 * Abstracts away the class constructors to a single function
 */

export type GenericSchemaTemplate = StringSchemaTemplate | BooleanSchemaTemplate | ObjectSchemaTemplate | NumberSchemaTemplate | NullSchemaTemplate
export type GenericSchema = StringSchema | BooleanSchema | ObjectSchema | NumberSchema | NullSchema
export default function createSchema(constructor: GenericSchemaTemplate) : GenericSchema{
    switch(constructor.type){
        case "string":
            return new StringSchema(constructor)
        case "boolean":
            return new BooleanSchema(constructor)
        case "number":
            return new NumberSchema(constructor)
        case "object":
            return new ObjectSchema(constructor)
        case "null":
            return new NullSchema(constructor)

    }
}