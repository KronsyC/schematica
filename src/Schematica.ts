
import { AnySchema, AnySchemaTemplate, ArraySchema, ArraySchemaTemplate, BaseSchema, BooleanSchema, BooleanSchemaTemplate, NumberSchema, NumberSchemaTemplate, ObjectSchema, ObjectSchemaTemplate, StringSchema, StringSchemaTemplate } from "./lib/Schemas";
/**
 * This is the base class initialized by the user
 * Responsible for managing caching as well as the other utilities
 */

import Validator, { ValidatorOptions } from "./lib/utilities/Validator/Validator";
import ERR_UNKNOWN_REF from "./errors/Schematica/ERR_UNKNOWN_REF";
import Encoder from "./lib/utilities/Encoder/Encoder";
import {
    GenericSchema as Schema,
    GenericSchemaTemplate as SchemaTemplate,
    Parser,
} from ".";
import newSchema from "./lib/Schemas";

const kValidator =      Symbol("Validator");
const kParser =         Symbol("Parser");
const kEncoder =        Symbol("Encoder");
const kSchemaRefStore = Symbol("Schema Store");


export default class Schematica {
    // Store the scemas with their refs
    [kSchemaRefStore]: Map<string, Schema> = new Map();

    // Define all the utilities provided by Schematica
    [kValidator]: Validator;
    [kEncoder]: Encoder;
    [kParser]: Parser;
    constructor() {
        this[kValidator] = new Validator();
        this[kEncoder] = new Encoder({validator: this[kValidator]});
        this[kParser] = new Parser({validator:   this[kValidator]});
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

    buildSerializer(schema:AnySchema):(data:any)=>string
    buildSerializer(schema:BooleanSchema):(data:boolean)=>string
    buildSerializer(schema:NumberSchema):(data:number)=>string
    buildSerializer(schema:ObjectSchema):(data:object)=>string
    buildSerializer(schema:StringSchema):(data:string)=>string
    buildSerializer(schema:ArraySchema):(data:any[]) => string
    buildSerializer(schema: Schema) {
        return this[kEncoder].build(schema);
    }
    createSchema(schema:AnySchemaTemplate):AnySchema
    createSchema(schema:BooleanSchemaTemplate):BooleanSchema
    createSchema(schema:ObjectSchemaTemplate):ObjectSchema
    createSchema(schema:NumberSchemaTemplate):NumberSchema
    createSchema(schema:StringSchemaTemplate):StringSchema
    createSchema(schema:ArraySchemaTemplate):ArraySchema
    createSchema(schema: SchemaTemplate): Schema {
        const sch = newSchema(schema, this[kSchemaRefStore]);
        if (sch.name) {
            this[kSchemaRefStore].set(sch.name, sch);
        }
        return sch;
    }

    buildParser(schema:Schema): any{
        return this[kParser].build(schema)
    }
}
