import { GenericSchema } from '../../..';
import {  BooleanSchema, NumberSchema, ObjectSchema, StringSchema, TextEncoding } from "../../Schemas";


const checkStringEncoding = (function(
    text: string,
    encoding: TextEncoding
): boolean {
    switch (encoding) {
        case "utf8":
        case "ascii":
            // 128 total character values
            for (let char of text) {
                if (char.charCodeAt(0) > 127) {
                    return false;
                }
            }
            break;
        case "unicode":
            return true // I know this is terrible and may fail, but it's optimized TODO: Make this actually check
    }
    return true;
})

class ValidatorBuilder {
    buildStringValidator(schema: StringSchema) {
        const stringValidator = (function (data: unknown) {
            if (typeof data === "string") {
                if (!checkStringEncoding(data, schema.encoding)) {
                    return false;
                }
                else if(data.length>schema.maxLength){
                    return false
                }
                else if(data.length<schema.minLength){
                    return false
                }
                    // Run the Regex last because it is expensive
                if (schema.match) {                        
                    if (schema.match.test(data)) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return true;
            }
            else{
                return false
            }
        })
        // return stringValidator
        return stringValidator;
    }
    buildNumberValidator(schema: NumberSchema) {
        const numberValidator = function (data: unknown) {
            if (
                typeof data === "number" &&
                (schema.max ? data <= schema.max : true) &&
                (schema.min ? data >= schema.min : true)
            ) {
                return true;
            } else {
                return false;
            }
        };
        return numberValidator;

    }
    buildObjectValidator(schema: ObjectSchema) {
        
        // Build all the child validators and add them to an object
        const validators: { [key: string]: Function } = {};

        for (let [name, sch] of schema.properties) {
            const built = this.build(sch)
            sch.cache.set("validator", built)
            validators[name] = built;
        }
        const schemaprops = schema.properties
        const objectValidator = (function(data: unknown, shallow=false) {
            
            if (data&&typeof data === "object") {
                // return true
                
                for(let r of schema.required){
                    if(!Object.keys(data).includes(r)){         
                                       
                        return false
                    }
                }
                
                if(!shallow){
                    
                    // This function validates all children, the shallow option allows the function to do it's own validation
                    for (let [key, value] of Object.entries(data)) {
                        if (schemaprops.has(key)) {
                            
                            const validator = validators[key];
    
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
                }
                
                return true;
            } else {
                
                return false;
            }
        })

        return objectValidator;
    }
    buildBooleanValidator(schema: BooleanSchema) {
        function booleanValidator(data: unknown) {
            if (typeof data === "boolean") {
                return true;
            } else {
                return false;
            }
        }
        return booleanValidator;
    }
    build(schema: GenericSchema ): (data: unknown, shallow?:boolean) => boolean {
        let validator;

        switch (schema.constructor) {
            case BooleanSchema:
                
                validator = this.buildBooleanValidator(schema as BooleanSchema);
                break;
            case NumberSchema:
                validator = this.buildNumberValidator(schema as NumberSchema);
                break;
            case ObjectSchema:
                validator = this.buildObjectValidator(schema as ObjectSchema);
                break;
            case StringSchema:
                validator = this.buildStringValidator(schema as StringSchema);
                break;
            default:
                throw new Error("Invalid Schema Type");
        }

        schema.cache.set("validator", validator);
        return validator;
    }
}
const kBuilder = Symbol("Validator Builder");
export default class Validator {
    [kBuilder]: ValidatorBuilder;
    constructor() {
        this[kBuilder] = new ValidatorBuilder();
    }

    build(schema: GenericSchema) {
        return this[kBuilder].build(schema);
    }
}
