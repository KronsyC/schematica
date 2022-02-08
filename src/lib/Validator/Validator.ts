import { GenericSchema } from '../..';
import newSchema, {  BooleanSchema, NumberSchema, ObjectSchema, StringSchema, TextEncoding } from "../Schemas";


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
        const stringValidator = function (data: unknown) {
            if (typeof data === "string") {
                if (typeof data === "string" && schema.encoding) {
                    if (!checkStringEncoding(data, schema.encoding)) {
                        return false;
                    }
                }
                if (
                    typeof data === "string" &&
                    (schema.maxLength
                        ? data.length <= schema.maxLength
                        : true) &&
                    (schema.minLength
                        ? data.length >= schema.minLength
                        : true)
                ) {
                    // Run the Regex last because it is expensive
                    if (schema.match && typeof data === "string") {
                        if (schema.match.test(data)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
            return true;
        };
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

        function objectValidator(data: unknown) {
            if (data && typeof data === "object") {
                const schemaprops = schema.properties
                
                for(let r of schema.required){
                    console.log(r);
                    console.log(Object.keys(data));
                    
                    if(!Object.keys(data).includes(r)){
                        console.log("Bad");
                        
                        return false
                    }
                }
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
                return true;
            } else {
                return false;
            }
        }

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
    build(schema: GenericSchema ): (data: unknown) => boolean {
        let validator;
        console.log(`Building ${typeof schema} validator`);

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
