import {
    AnySchema,
    AnySchemaTemplate,
    ArraySchema,
    ArraySchemaTemplate,
    BaseSchema,
    BooleanSchema,
    BooleanSchemaTemplate,
    GenericSchema,
    NumberSchema,
    NumberSchemaTemplate,
    ObjectSchema,
    ObjectSchemaTemplate,
    StringSchema,
    StringSchemaTemplate,
} from "./Schemas";
/**
 * This is the base class initialized by the user
 * Responsible for managing caching as well as the other utilities
 */

import Validator, { ValidatorOptions } from "./lib/Validator/Validator";
import ERR_UNKNOWN_REF from "./errors/Schematica/ERR_UNKNOWN_REF";
import Encoder, { BuildEncoderOptions } from "./lib/Encoder/Encoder";
import { GenericSchema as Schema, GenericSchemaTemplate as SchemaTemplate, Parser } from ".";
import newSchema from "./Schemas";
import Normalizer from "./lib/Normalizer/Normalizer";

const kValidator = Symbol("Validator");
const kParser = Symbol("Parser");
const kEncoder = Symbol("Encoder");
const kNormalizer = Symbol("Normalizer");
const kSchemaRefStore = Symbol("Schema Store");

export interface SchematicaOptions {}

export interface SchematicaError {
    type: string;
    context: string;
    reason: string;
}


type EncoderFn<InputType> = {
    error?: SchematicaError;

    (data: InputType): string;
};
type ValidatorFn<InputType> = {
    error?: SchematicaError;
    // Undefined is there for nullable schemas
    (data: InputType|undefined): boolean;
};

export default class Schematica {
    // Store the scemas with their refs
    [kSchemaRefStore]: Map<string, Schema> = new Map();

    // Define all the utilities provided by Schematica
    [kValidator]: Validator;
    [kEncoder]: Encoder;
    [kParser]: Parser;
    [kNormalizer]: Normalizer;
    constructor(options: SchematicaOptions = {}) {
        this[kValidator] = new Validator();
        this[kEncoder] = new Encoder({ validator: this[kValidator] });
        this[kParser] = new Parser({ validator: this[kValidator] });
        this[kNormalizer] = new Normalizer({ validator: this[kValidator] });
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
     * @param schema The Schema to validate against
     * @description Creates a function to validate data against the schema   
     * returns `true` or `false` depending on the validity   
     * if it returns false, you can access the error with `validator.error`
     */
    buildValidator(schema: AnySchema, options?: ValidatorOptions): ValidatorFn<any>;
    buildValidator(schema: BooleanSchema, options?: ValidatorOptions): ValidatorFn<boolean>;
    buildValidator(schema: NumberSchema, options?: ValidatorOptions): ValidatorFn<number>;
    buildValidator(schema: ObjectSchema, options?: ValidatorOptions): ValidatorFn<object>;
    buildValidator(schema: StringSchema, options?: ValidatorOptions): ValidatorFn<string>;
    buildValidator(schema: ArraySchema, options?: ValidatorOptions): ValidatorFn<any[]>;
    buildValidator(schema: Schema, options?: ValidatorOptions): ValidatorFn<unknown>;
    buildValidator(schema: Schema, options?: ValidatorOptions): (data: unknown) => boolean {
        return this[kValidator].build(schema, options);
    }
    /**
     * 
     * @param schema The Schema to encode for
     * @param options Options for the encoder   
     * *`onAdditionalProperty`* : `skip` | `error` => should the encoder throw an error or quietly skip when encoding an unknown property   
     * 
     * @description
     * Serializes Data as a JSON string with accordance to the schema
     * 
     * @returns The Serialized JSON string, or null
     */
    buildSerializer(schema: AnySchema, options?: BuildEncoderOptions): EncoderFn<any>;
    buildSerializer(schema: BooleanSchema, options?: BuildEncoderOptions): EncoderFn<boolean>;
    buildSerializer(schema: NumberSchema, options?: BuildEncoderOptions): EncoderFn<number>;
    buildSerializer(schema: ObjectSchema, options?: BuildEncoderOptions): EncoderFn<object>;
    buildSerializer(schema: StringSchema, options?: BuildEncoderOptions): EncoderFn<string>;
    buildSerializer(schema: ArraySchema, options?: BuildEncoderOptions): EncoderFn<any[]>;
    buildSerializer(schema: Schema, options?: BuildEncoderOptions): EncoderFn<unknown>;

    buildSerializer(schema: Schema, options: BuildEncoderOptions = {}) {
        return this[kEncoder].build(schema, options);
    }

    buildNormalizer(schema: AnySchema): (data: any) => any;
    buildNormalizer(schema: BooleanSchema): (data: any) => boolean;
    buildNormalizer(schema: NumberSchema): (data: any) => number;
    buildNormalizer(schema: ObjectSchema): (data: object) => object;
    buildNormalizer(schema: StringSchema): (data: any) => string;
    buildNormalizer(schema: ArraySchema): (data: any[]) => any[];
    buildNormalizer(schema: Schema): (data: any) => any;
    buildNormalizer(schema: Schema) {
        return this[kNormalizer].build(schema);
    }

    createSchema(schema: AnySchemaTemplate): AnySchema;
    createSchema(schema: BooleanSchemaTemplate): BooleanSchema;
    createSchema(schema: ObjectSchemaTemplate): ObjectSchema;
    createSchema(schema: NumberSchemaTemplate): NumberSchema;
    createSchema(schema: StringSchemaTemplate): StringSchema;
    createSchema(schema: ArraySchemaTemplate): ArraySchema;
    createSchema(schema: SchemaTemplate): Schema;
    createSchema(schema: SchemaTemplate): Schema {
        const sch = newSchema(schema, this[kSchemaRefStore]);
        if (sch.ref) {
            this[kSchemaRefStore].set(sch.ref, sch);
        }
        return sch;
    }

    buildParser(schema: Schema): any {
        return this[kParser].build(schema);
    }
}
