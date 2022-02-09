"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _StringSchema_1 = require("./../Schemas/_StringSchema");
const Validator_1 = __importDefault(require("../Validator/Validator"));
const __1 = require("../..");
const ERR_INVALID_DATA_1 = __importDefault(require("./errors/ERR_INVALID_DATA"));
class Encoder {
    validator;
    constructor(opts = {}) {
        opts.validator
            ? (this.validator = opts.validator)
            : (this.validator = new Validator_1.default());
    }
    buildJson(object, schema) {
        if (schema.additionalProperties) {
            return JSON.stringify(schema);
        }
        let json = "{";
        schema.properties.forEach((value, key) => {
            const encoder = value.cache.get("serializer");
            const encode = object[key];
            if (!encode && !schema.required.includes(key)) {
                return;
            }
            const encoded = encoder(encode);
            json += `"${key}":${encoded},`;
        });
        return json.slice(0, -1) + "}";
    }
    getValidator(schema) {
        let validator = schema.cache.get("validator");
        if (!validator) {
            validator = this.validator.build(schema);
        }
        return validator;
    }
    buildObjectEncoder(schema) {
        const objectEncoder = (data) => {
            const isValid = validator(data, true);
            if (typeof data === "object" && !!data && isValid) {
                let json = this.buildJson(data, schema);
                return json;
            }
            else {
                throw new ERR_INVALID_DATA_1.default();
            }
        };
        const validator = this.getValidator(schema);
        schema.properties.forEach((p) => {
            p.cache.set("serializer", this.build(p));
        });
        return objectEncoder;
    }
    buildBooleanEncoder(schema) {
        function booleanEncoder(data) {
            if (typeof data === "boolean") {
                if (data)
                    return "true";
                else
                    return "false";
            }
            else {
                throw new ERR_INVALID_DATA_1.default();
            }
        }
        return booleanEncoder;
    }
    buildNumberEncoder(schema) {
        const numberEncoder = (data) => {
            if (validator(data)) {
                return JSON.stringify(data);
            }
            else {
                throw new ERR_INVALID_DATA_1.default();
            }
        };
        const validator = this.getValidator(schema);
        return numberEncoder;
    }
    buildStringEncoder(schema) {
        const stringEncoder = (data) => {
            if (validator(data)) {
                return `"${data}"`;
            }
            else {
                throw new ERR_INVALID_DATA_1.default();
            }
        };
        const validator = this.getValidator(schema);
        return stringEncoder;
    }
    build(schema) {
        let encoder;
        switch (schema.constructor) {
            case __1.BooleanSchema:
                encoder = this.buildBooleanEncoder(schema);
                break;
            case __1.NumberSchema:
                encoder = this.buildNumberEncoder(schema);
                break;
            case __1.ObjectSchema:
                encoder = this.buildObjectEncoder(schema);
                break;
            case _StringSchema_1.StringSchema:
                encoder = this.buildStringEncoder(schema);
                break;
            default:
                throw new Error(`No encoder exists for type ${schema.constructor.name}`);
        }
        schema.cache.set("serializer", encoder);
        return encoder;
    }
}
exports.default = Encoder;
