import { defaultStringSchema, Schema } from ".";
import ERR_INVALID_RANGE from "./errors/ERR_INVALID_RANGE";
import ERR_TYPE_MISMATCH from "./errors/ERR_TYPE_MISMATCH";
import ERR_UNKNOWN_REF from "./errors/ERR_UNKNOWN_REF";
import { VSchema } from "./types/validatorSchema";
import checkStringEncoding from "./util/checkStringEncoding";
const kSchemaRefStore = Symbol("Schema Reference Store")

class ValidatorBuilder{
    static buildStringValidator(schema:VSchema) {
        // Use the defaults, and overwrite with the provided values
        schema = Object.assign(defaultStringSchema, schema)

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
    static buildArrayValidator(schema:VSchema) {
        function arrayValidator(data:unknown){
            return true
        }
        return arrayValidator
    }
    static buildNumberValidator(schema:VSchema) {
        
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
    static buildObjectValidator(schema:VSchema){
        
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
    static buildBooleanValidator(schema:VSchema) {
        function booleanValidator(data: unknown) {
            if (typeof data === 'boolean') {
                return true;
            } else {
                return false;
            }
        }
        return booleanValidator
    }

    static build(schema:Schema){
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
export default class Validator {

    // Store the scemas with their names
    [kSchemaRefStore]: Map<string, Schema> = new Map()

    addSchema(schema:Schema|VSchema){
        if(schema instanceof Schema){
            // Call the build method directly
            const name = schema.name
            if(name){
                this[kSchemaRefStore].set(name, schema)  
            }
            return ValidatorBuilder.build(schema)
        }
        else{
            
            // Instantiate a new Schema and build it
            const sc = new Schema(schema)
            
            if(sc.name){
                
                this[kSchemaRefStore].set(sc.name, sc)
                
            }

            
            const built = ValidatorBuilder.build(sc)
            
            return built
        }
    }
    getSchema(ref:string){
        if(this[kSchemaRefStore].has(ref)){
            return this[kSchemaRefStore].get(ref)
        }
        else{
            throw new ERR_UNKNOWN_REF()
        }
    }
}
