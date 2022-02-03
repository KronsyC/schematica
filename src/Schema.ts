import { defaultStringSchema, SchemaType } from "./types/schemas";
import { Schema as ISchema } from "./types/schemas";
import ERR_INVALID_RANGE from "./errors/ERR_INVALID_RANGE";
import ERR_TYPE_MISMATCH from "./errors/ERR_TYPE_MISMATCH";
import setStringEncoding from "./util/setStringEncoding";

const kBuildObjectValidator = Symbol("Build Object Validator");
const kBuildNumberValidator = Symbol("Build Number Validator");
const kBuildStringValidator = Symbol("Build String Validator");
const kBuildArrayValidator = Symbol("Build Array Validator");
const kBuildBooleanValidator = Symbol("Build Boolean Validator");

export default class Schema {
    type: SchemaType;
    name?:string;
    schema: ISchema;
    cachedValidator?:(data:any)=>boolean;
    constructor(opts: ISchema) {
        this.name=opts.name
        this.type = opts.type;
        this.schema = opts;
    }

    [kBuildStringValidator]() {
        // Use the defaults, and overwrite with the provided values
        const schema = Object.assign(defaultStringSchema, this.schema)

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
                        data = setStringEncoding(data, schema.encoding)
                        console.log(data);                        
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
    [kBuildArrayValidator]() {
        function arrayValidator(data:unknown){
            return true
        }
        return arrayValidator
    }
    [kBuildNumberValidator]() {
        const schema = this.schema;
        
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
    [kBuildObjectValidator]() {
        
        const schema = this.schema;
        // Build all the child validators and add them to an object
        const validators: { [key: string]: Function } = {};
        
        if (schema.type === "object") {
            
            for (let [name, schemaProperties] of Object.entries(schema.properties)) {
                
                const sch = new Schema(schemaProperties)
                
                validators[name] = sch.build();  
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
    [kBuildBooleanValidator]() {
        function booleanValidator(data: unknown) {
            if (typeof data === 'boolean') {
                return true;
            } else {
                return false;
            }
        }
        return booleanValidator
    }
    /**
     *
     */
    build() {       
        if(this.cachedValidator){        
            return this.cachedValidator
        }
        let validator:(data:unknown)=>boolean
        
        switch (this.type) {
            case "array":
                validator = this[kBuildArrayValidator]();
                break;

            case "boolean":
                validator = this[kBuildBooleanValidator]();
                break;

            case "number":
                validator = this[kBuildNumberValidator]();
                break;

            case "object":
                validator = this[kBuildObjectValidator]();
                break;
            case "string":
                validator = this[kBuildStringValidator]();
                break;

        }
        this.cachedValidator = validator
        
        return validator
    }
}
