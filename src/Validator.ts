import { defaultStringSchema, Schema } from ".";
import ERR_INVALID_RANGE from "./errors/ERR_INVALID_RANGE";
import ERR_TYPE_MISMATCH from "./errors/ERR_TYPE_MISMATCH";
import {Schema as SchemaT} from "./types/schemas";
import checkStringEncoding from "./util/checkStringEncoding";
import rfdc from "rfdc"

class ValidatorBuilder{
    buildStringValidator(schema:SchemaT) {
        // Use the defaults, and overwrite with the provided values
        // FIXME: Speed this up, may be a bottleneck in the future  
        schema =  Object.assign(rfdc({proto:true})(defaultStringSchema), schema)
        
        if (schema.type === "string") {
            
            if (schema.maxLength && schema.minLength && !(schema.maxLength - schema.minLength >= 0)) {
                // Invalid range was provided, i.e min greater than max
                throw new ERR_INVALID_RANGE();
            }
                    
            function stringValidator(data: unknown) {               
                if(schema.type==="string"&&typeof data === "string"){
                    if(schema.trim){
                        data = data.trim()
                    }
                    if(typeof data==="string"&&schema.encoding){
                        if(!checkStringEncoding(data, schema.encoding)){
                            return false
                        }                     
                    }
                    if(
                        typeof data==="string"&&
                        (schema.maxLength
                            ? data.length <= schema.maxLength
                            : true) && (schema.minLength
                            ? data.length >= schema.minLength
                            : true)
                    ){
                        // Run the Regex last because it is expensive
                        if(schema.match&&typeof data==="string"){
                            
                            if(schema.match.test(data)){
                                
                                return true
                            }
                            else{
                                return false
                            }
                        }
                        return true
                    }
                    else{
                        return false
                    }

                }
                else{
                    return false
                }
            }
            
            return stringValidator
        } else {
            // This shouldnt ever run, but just to be safe     
              
            throw new ERR_TYPE_MISMATCH();
        }
        

        
    }
    buildArrayValidator(schema:SchemaT) {
        function arrayValidator(data:unknown){
            return true
        }
        return arrayValidator
    }
    buildNumberValidator(schema:SchemaT) {
        
        if (schema.type === "number") {
            
            if (schema.max && schema.min && !(schema.max - schema.min >= 0)) {
                // Invalid range was provided, i.e min greater than max
                throw new ERR_INVALID_RANGE();
            }
            function numberValidator(data: unknown) {
                if (
                    schema.type == "number" &&
                    typeof data === "number" &&
                    (schema.max
                        ? data <= schema.max
                        : true && schema.min
                        ? data >= schema.min
                        : true)
                ) {
                    return true;
                } else {
                    return false;
                }
            }
            
            return numberValidator;
        } else {
            // This shouldnt ever run, but just to be safe     
              
            throw new ERR_TYPE_MISMATCH();
        }
    }
    buildObjectValidator(schema:SchemaT){
        
        // Build all the child validators and add them to an object
        const validators: { [key: string]: Function } = {};
        
        if (schema.type === "object") {
            
            for (let [name, schemaProperties] of Object.entries(schema.properties)) {
                
                const sch = new Schema(schemaProperties)
                
                
                validators[name] = this.build(sch);
                
            }
        } else {
            // This should never actually run, but better to be safe than sorry     
            throw new ERR_TYPE_MISMATCH();
        }
        function objectValidator(data: unknown) {
            
            if (data && typeof data === "object" && schema.type === "object") {
                const schemaKeys = Object.keys(schema.properties);
                if(schema.required && (Object.keys(data).length < schema.required.length)){
                    return false
                }
                for (let [key, value] of Object.entries(data)) {

                    if (schemaKeys.includes(key)) {
                        const validator = validators[key];
                        if (!validator) {
                            throw new Error(
                                "Validators were not properly built"
                            );
                        }
                        if (!validator(value)) {
                            return false;
                        }
                    } else {
                        // The key is excess
                        // Return false if additional Properties are not allowed
                        if (!schema.additionalProperties) {
                            return false;
                        }
                    }
                }
                return true;
            } else {
                return false;
            }
            return false;
        }
        
        return objectValidator;
    }
    buildBooleanValidator(schema:SchemaT) {
        function booleanValidator(data: unknown) {
            if (typeof data === 'boolean' &&schema.type === "boolean") {
                return true;
            } else {
                return false;
            }
        }
        return booleanValidator
    }

    build(schema:Schema){
        
        
        switch(schema.type){
            case "array":
                return this.buildArrayValidator(schema.schema);
            case "boolean":
                return this.buildBooleanValidator(schema.schema);
            case "number":
                return this.buildNumberValidator(schema.schema);
            case "object":
                return this.buildObjectValidator(schema.schema);
            case "string":
                return this.buildStringValidator(schema.schema);
            
        }
    }
}
const kBuilder = Symbol("Validator Builder")
export default class Validator {
    [kBuilder]:ValidatorBuilder
    constructor() {
        this[kBuilder] = new ValidatorBuilder()
    }

    build(schema:Schema){
        return this[kBuilder].build(schema)
    }
}
