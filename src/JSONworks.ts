import { BaseSchema } from './lib/Schemas/__BaseSchema';
/**
 * This is the base class initialized by the user
 * Responsible for managing caching as well as the other utilities
 */

import Validator from "./lib/Validator/Validator";
import ERR_UNKNOWN_REF from "./errors/JSONworks/ERR_UNKNOWN_REF";
import Encoder from "./lib/Encoder/Encoder";
import { GenericSchema, GenericSchemaTemplate } from ".";
import newSchema from "./lib/Schemas";

const kValidator = Symbol("Validator");
const kParser = Symbol("Parser");
const kEncoder = Symbol("Encoder");
const kSchemaRefStore = Symbol("Schema Store");

export default class JSONworks {
    // Store the scemas with their refs
    [kSchemaRefStore]: Map<string, GenericSchema> = new Map();
    [kValidator]:Validator
    [kEncoder]:Encoder
    constructor() {
        this[kValidator] = new Validator()
        this[kEncoder] = new Encoder()
    }
    

    /**
     * 
     * @param schema A schema strucure or a schema template
     * @description Create a schema and saves it
     */
    addSchema(schema:GenericSchema):GenericSchema
    addSchema(template:GenericSchemaTemplate):GenericSchema
    addSchema(schema: GenericSchema|GenericSchemaTemplate):GenericSchema {
        // Instantiate a new Schema and return it
        let sc:GenericSchema
        if(schema instanceof BaseSchema){
            sc = schema
        }
        else{
            sc = this.createSchema(schema)
        }

        if (sc.name) {
            if(sc.name.includes(" ")){
                throw new Error("Schema names cannot contain whitespace").name = "ERR_INVALID_SCHEMA_REF"
            }
            this[kSchemaRefStore].set(sc.name, sc);
        }
        return sc;
    }
    /**
     * 
     * @param schema The schema you want to create
     * @description Create a schema with the given template
     */
    createSchema(schema:GenericSchemaTemplate):GenericSchema{
        return newSchema(schema)
    }
    getSchema(ref: string):GenericSchema {
        const schema = this[kSchemaRefStore].get(ref);
        if (schema) {
            return schema
        } else {
            throw new ERR_UNKNOWN_REF();
        }
    }

    /**
     * 
     * @param schema The Schema to create a validator for
     * @description Build a Validator function for the provided Schema
     */
    buildValidator(schema:GenericSchema): (data:unknown)=>boolean
    buildValidator(ref:string): (data:unknown)=>boolean
    buildValidator(arg:GenericSchema|string): (data:unknown)=>boolean{
        if(typeof arg === "string"){
            return this.buildValidator(this.getSchema(arg))
        }
        else if (arg instanceof BaseSchema){
            return this[kValidator].build(arg)
        }
        else{
            throw new Error("The Argument passed to buildValidator was not a string or Schema").name="ERR_INVALID_ARGS"
        }
    }


    buildSerializer(schema:GenericSchema): (data:unknown)=>string{
        return this[kEncoder].build(schema)
    }
}
