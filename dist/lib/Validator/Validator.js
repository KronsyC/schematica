"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schemas_1 = require("../Schemas");
const checkStringEncoding = (function (text, encoding) {
    switch (encoding) {
        case "utf8":
        case "ascii":
            for (let char of text) {
                if (char.charCodeAt(0) > 127) {
                    return false;
                }
            }
            break;
        case "unicode":
            return true;
    }
    return true;
});
class ValidatorBuilder {
    buildStringValidator(schema) {
        const stringValidator = (function (data) {
            if (typeof data === "string") {
                if (!checkStringEncoding(data, schema.encoding)) {
                    return false;
                }
                else if (data.length > schema.maxLength) {
                    return false;
                }
                else if (data.length < schema.minLength) {
                    return false;
                }
                if (schema.match) {
                    if (schema.match.test(data)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                return true;
            }
            else {
                return false;
            }
        });
        return stringValidator;
    }
    buildNumberValidator(schema) {
        const numberValidator = function (data) {
            if (typeof data === "number" &&
                (schema.max ? data <= schema.max : true) &&
                (schema.min ? data >= schema.min : true)) {
                return true;
            }
            else {
                return false;
            }
        };
        return numberValidator;
    }
    buildObjectValidator(schema) {
        const validators = {};
        for (let [name, sch] of schema.properties) {
            const built = this.build(sch);
            sch.cache.set("validator", built);
            validators[name] = built;
        }
        const schemaprops = schema.properties;
        const objectValidator = (function (data, shallow = false) {
            if (data && typeof data === "object") {
                for (let r of schema.required) {
                    if (!Object.keys(data).includes(r)) {
                        return false;
                    }
                }
                if (!shallow) {
                    for (let [key, value] of Object.entries(data)) {
                        if (schemaprops.has(key)) {
                            const validator = validators[key];
                            if (!validator(value)) {
                                return false;
                            }
                        }
                        else {
                            if (!schema.additionalProperties) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
            else {
                return false;
            }
        });
        return objectValidator;
    }
    buildBooleanValidator(schema) {
        function booleanValidator(data) {
            if (typeof data === "boolean") {
                return true;
            }
            else {
                return false;
            }
        }
        return booleanValidator;
    }
    build(schema) {
        let validator;
        switch (schema.constructor) {
            case Schemas_1.BooleanSchema:
                validator = this.buildBooleanValidator(schema);
                break;
            case Schemas_1.NumberSchema:
                validator = this.buildNumberValidator(schema);
                break;
            case Schemas_1.ObjectSchema:
                validator = this.buildObjectValidator(schema);
                break;
            case Schemas_1.StringSchema:
                validator = this.buildStringValidator(schema);
                break;
            default:
                throw new Error("Invalid Schema Type");
        }
        schema.cache.set("validator", validator);
        return validator;
    }
}
const kBuilder = Symbol("Validator Builder");
class Validator {
    [kBuilder];
    constructor() {
        this[kBuilder] = new ValidatorBuilder();
    }
    build(schema) {
        return this[kBuilder].build(schema);
    }
}
exports.default = Validator;
