
import { AnySchema, AnySchemaTemplate, ArraySchema, ArraySchemaTemplate, BaseSchema, BooleanSchema, BooleanSchemaTemplate, GenericSchema, NumberSchema, NumberSchemaTemplate, ObjectSchema, ObjectSchemaTemplate, StringSchema, StringSchemaTemplate } from "./lib/Schemas";
/**
 * This is the base class initialized by the user
 * Responsible for managing caching as well as the other utilities
 */

import Validator, { ValidatorOptions } from "./lib/utilities/Validator/Validator";
import ERR_UNKNOWN_REF from "./errors/Schematica/ERR_UNKNOWN_REF";
import Encoder, { BuildEncoderOptions } from "./lib/utilities/Encoder/Encoder";
import {
    GenericSchema as Schema,
    GenericSchemaTemplate as SchemaTemplate,
    Parser,
} from ".";
import newSchema from "./lib/Schemas";
import Normalizer from "./lib/utilities/Normalizer/Normalizer";

const kValidator      =      Symbol("Validator");
const kParser         =      Symbol("Parser");
const kEncoder        =      Symbol("Encoder");
const kNormalizer     =      Symbol("Normalizer")
const kSchemaRefStore =      Symbol("Schema Store");

export default class Schematica {
    // Store the scemas with their refs
    [kSchemaRefStore]: Map<string, Schema> = new Map();

    // Define all the utilities provided by Schematica
    [kValidator]: Validator;
    [kEncoder]: Encoder;
    [kParser]: Parser;
    [kNormalizer]:Normalizer;
    constructor() {
        this[kValidator] = new Validator();
        this[kEncoder] = new Encoder({validator: this[kValidator]});
        this[kParser] = new Parser({validator:   this[kValidator]});
        this[kNormalizer] = new Normalizer({validator: this[kValidator]})
    }
    /**
     *
     * @param schema The schema you want to create
     * @description Create a schema with the given template
     */

    getSchema(ref: string): Schema {
        const schema = this[kSchemaRefStore].get(ref);
        if (schema) {
            return schema;
        } else {
            throw new ERR_UNKNOWN_REF();
        }
    }

    /**
     *
     * @param schema The Schema to create a validator for
     * @description Build a Validator function for the provided Schema
     */
    buildValidator(schema: Schema, options?:ValidatorOptions): (data: unknown) => boolean;
    buildValidator(ref: string, options?:ValidatorOptions): (data: unknown) => boolean;
    buildValidator(arg: Schema | string, options?:ValidatorOptions): (data: unknown) => boolean {
        if (typeof arg === "string") {
            return this.buildValidator(this.getSchema(arg), options);
        } else if (arg instanceof BaseSchema) {
            //@ts-ignore-error
            return this[kValidator].build(arg, options);
        } else {
            throw (new Error(
                "The Argument passed to buildValidator was not a string or Schema"
            ).name = "ERR_INVALID_ARGS");
        }
    }
    buildSerializer(schema:AnySchema, options?:BuildEncoderOptions):(data:any)=>string
    buildSerializer(schema:BooleanSchema, options?:BuildEncoderOptions):(data:boolean)=>string
    buildSerializer(schema:NumberSchema, options?:BuildEncoderOptions):(data:number)=>string
    buildSerializer(schema:ObjectSchema, options?:BuildEncoderOptions):(data:object)=>string
    buildSerializer(schema:StringSchema, options?:BuildEncoderOptions):(data:string)=>string
    buildSerializer(schema:ArraySchema, options?:BuildEncoderOptions):(data:any[]) => string
    buildSerializer(schema:Schema, options?:BuildEncoderOptions):(data:unknown)=>string
    buildSerializer(schema: Schema, options:BuildEncoderOptions={}) {
        return this[kEncoder].build(schema, options);
    }

    buildNormalizer(schema:AnySchema):(data:any)=>any
    buildNormalizer(schema:BooleanSchema):(data:any)=>boolean
    buildNormalizer(schema:NumberSchema):(data:any)=>number
    buildNormalizer(schema:ObjectSchema):(data:object)=>object
    buildNormalizer(schema:StringSchema):(data:any)=>string
    buildNormalizer(schema:ArraySchema):(data:any[]) => any[]
    buildNormalizer(schema:Schema):(data:any)=>any
    buildNormalizer(schema: Schema) {
        return this[kNormalizer].build(schema)   
    }
    
    createSchema(schema:AnySchemaTemplate):AnySchema
    createSchema(schema:BooleanSchemaTemplate):BooleanSchema
    createSchema(schema:ObjectSchemaTemplate):ObjectSchema
    createSchema(schema:NumberSchemaTemplate):NumberSchema
    createSchema(schema:StringSchemaTemplate):StringSchema
    createSchema(schema:ArraySchemaTemplate):ArraySchema
    createSchema(schema:SchemaTemplate): Schema
    createSchema(schema: SchemaTemplate): Schema {
        const sch = newSchema(schema, this[kSchemaRefStore]);
        if (sch.ref) {
            this[kSchemaRefStore].set(sch.ref, sch);
        }
        return sch;
    }

    buildParser(schema:Schema): any{
        return this[kParser].build(schema)
    }
}
