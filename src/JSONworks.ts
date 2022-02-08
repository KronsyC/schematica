/**
 * This is the base class initialized by the user
 * Responsible for managing caching as well as the other utilities
 */

import Validator from "./Validator";
import { Schema as SchemaType } from "./types/schemas";
import Schema from "./Schema";
import ERR_UNKNOWN_REF from "./errors/JSONworks/ERR_UNKNOWN_REF";
import Encoder from "./Encoder";

const kValidator = Symbol("Validator");
const kParser = Symbol("Parser");
const kEncoder = Symbol("Encoder");
const kSchemaRefStore = Symbol("Schema Store");

export default class JSONworks {
    // Store the scemas with their refs
    [kSchemaRefStore]: Map<string, Schema> = new Map();
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
    addSchema(schema:Schema):Schema
    addSchema(template:SchemaType):Schema
    addSchema(schema: Schema|SchemaType):Schema {
        // Instantiate a new Schema and return it
        let sc:Schema
        if(schema instanceof Schema){
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
    createSchema(schema:SchemaType):Schema{
        return new Schema(schema)
    }
    getSchema(ref: string):Schema {
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
     buildValidator(schema:Schema): (data:unknown)=>boolean
    buildValidator(ref:string): (data:unknown)=>boolean
    buildValidator(arg:Schema|string): (data:unknown)=>boolean{
        if(typeof arg === "string"){
            return this.buildValidator(this.getSchema(arg))
        }
        else if (arg instanceof Schema){
            return this[kValidator].build(arg)
        }
        else{
            throw new Error("The Argument passed to buildValidator was not a string or Schema").name="ERR_INVALID_ARGS"
        }
    }
}
