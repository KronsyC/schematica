import { SchemaType } from './types/schemas';
import { Schema, Validator } from ".";
import ERR_BAD_TYPE from "./errors/schema/ERR_BAD_TYPE";
import ERR_TYPE_MISMATCH from "./errors/schema/ERR_TYPE_MISMATCH";
import ERR_MISMATCHED_DATA from './errors/encoder/ERR_MISMATCHED_DATA';

function assertSchemaType(schema:Schema, type: SchemaType){
    if(schema.schema.type===type){
        return undefined
    }
    else{
        throw new ERR_TYPE_MISMATCH()
    }
}

interface EncoderOpts{
    validator?: Validator;
}

/**
 * Transforms JS objects, numbers, booleans, etc. into strings
 */
export default class Encoder{
    private validator:Validator;
    constructor(opts:EncoderOpts={}){ 
        opts.validator?this.validator=opts.validator:this.validator=new Validator()
    }


    buildBooleanEncoder(schema:Schema): (data:unknown)=>string{
        function booleanEncoder(data:unknown){
            if(typeof data === "boolean"){
                if(data)return "true"
                else return "false"
            }
            else{
                throw new ERR_TYPE_MISMATCH()
            }
        }
        assertSchemaType(schema, "boolean")
        return booleanEncoder
    }
    buildNumberEncoder(schema:Schema): (data:unknown)=>string{
        
        const numberEncoder = (data:unknown) => {
            if(typeof data === "number"){
                let validator = schema.storage.get("validator")

                if(!validator){
                    validator = this.validator
                }
                if(validator(data)){
                    // Stringify is faster than any pure JS implementation
                    return JSON.stringify(data)
                }
                else{
                    throw new ERR_MISMATCHED_DATA()
                }


                
            }
            else{
                throw new ERR_TYPE_MISMATCH()

            }
        }

        assertSchemaType(schema, "number")
        return numberEncoder
        
    }
    /**
     * Build A JSON encoder with the provided schema
     */
    build(schema:Schema){
        switch(schema.type){
            case "boolean":
                return this.buildBooleanEncoder(schema)
            case "number":
                return this.buildNumberEncoder(schema)
            case "object":
                break;
            case "string":
                break;
        }
        return this.buildNumberEncoder(schema)

    }
}