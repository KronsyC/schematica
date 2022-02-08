import { ObjectSchema } from "./../../types/schemas";
import { SchemaType } from "../../types/schemas";
import ERR_TYPE_MISMATCH from "../../errors/schema/ERR_TYPE_MISMATCH";
import ERR_MISMATCHED_DATA from "../../errors/encoder/ERR_MISMATCHED_DATA";
import Validator from "../Validator/Validator";
import Schema from "../../Schema";
import ERR_BAD_TYPE from "../../errors/schema/ERR_BAD_TYPE";

function assertSchemaType(schema: Schema, type: SchemaType) {
    if (schema.schema.type === type) {
        return undefined;
    } else {
        throw new ERR_TYPE_MISMATCH();
    }
}

interface EncoderOpts {
    validator?: Validator;
}

/**
 * Transforms JS objects, numbers, booleans, etc. into strings
 */
export default class Encoder {
    private validator: Validator;
    constructor(opts: EncoderOpts = {}) {
        opts.validator
            ? (this.validator = opts.validator)
            : (this.validator = new Validator());
    }
    buildJson(object: any, _schema: Schema) {
        const schema = _schema.schema;
        if (schema.type === "object") {
            if (schema.additionalProperties) {
                return JSON.stringify(schema);
            }
            let json = "{";

            _schema.properties.forEach((value, key) => {

                const encoder = value.storage.get("serializer")
                
                const encoded = encoder(object[key])
                json+=`"${key}":${encoded},`
                
            });
            return json.slice(0, -1) + "}";
        } else {
            throw new ERR_BAD_TYPE();
        }
    }
    getValidator(schema: Schema): (data: unknown) => boolean {
        let validator = schema.storage.get("validator");
        if (!validator) {
            validator = this.validator.build(schema);
        }
        return validator;
    }

    buildObjectEncoder(schema: Schema): (data: unknown) => string {
        const objectEncoder = (data: unknown): string => {
            if (typeof data === "object") {
                if (validator(data) && typeof data === "object" && data) {
                    //TODO: Replace this with a clever stringify
                    let json = this.buildJson(data, schema);
                    return json;
                } else {
                    throw new ERR_MISMATCHED_DATA();
                }
            } else {
                throw new ERR_TYPE_MISMATCH();
            }
        };
        assertSchemaType(schema, "object");
        const validator = this.getValidator(schema);
        // Prebuild all encoders
        schema.properties.forEach((p) => {
            
            p.storage.set("serializer", this.build(p));
            
        });
        return objectEncoder;
    }
    buildBooleanEncoder(schema: Schema): (data: unknown) => string {
        function booleanEncoder(data: unknown) {
            if (typeof data === "boolean") {
                if (data) return "true";
                else return "false";
            } else {
                throw new ERR_TYPE_MISMATCH();
            }
        }
        assertSchemaType(schema, "boolean");
        return booleanEncoder;
    }
    buildNumberEncoder(schema: Schema): (data: unknown) => string {
        const numberEncoder = (data: unknown) => {
            if (typeof data === "number") {
                if (validator(data)) {
                    // Stringify is faster than any pure JS implementation for numbers
                    return JSON.stringify(data);
                } else {
                    throw new ERR_MISMATCHED_DATA();
                }
            } else {
                throw new ERR_TYPE_MISMATCH();
            }
        };

        assertSchemaType(schema, "number");
        const validator = this.getValidator(schema);
        return numberEncoder;
    }
    buildStringEncoder(schema: Schema): (data: unknown) => string {
        const stringEncoder = (data: unknown) => {
            if (typeof data === "string") {
                if (validator(data)) {
                    return `"${data}"`;
                } else {
                    throw new ERR_MISMATCHED_DATA();
                }
            } else {
                throw new ERR_TYPE_MISMATCH();
            }
        };
        assertSchemaType(schema, "string");
        const validator = this.getValidator(schema);
        return stringEncoder;
    }
    buildArrayEncoder(schema: Schema): (data: unknown) => string {
        const arrayEncoder = (data: unknown): string => {
            if (Array.isArray(data)) {
                if (validator(data) && typeof data === "object" && data) {
                    return "Sample Array"
                } else {
                    throw new ERR_MISMATCHED_DATA();
                }
            } else {
                throw new ERR_TYPE_MISMATCH();
            }
        };
        assertSchemaType(schema, "array");
        const validator = this.getValidator(schema);
        // Prebuild all encoders
        schema.properties.forEach((p) => {
            
            p.storage.set("serializer", this.build(p));
            
        });
        return arrayEncoder;
    }
    /**
     * Build A JSON encoder with the provided schema
     */
    build(schema: Schema) {
        let encoder;
        switch (schema.type) {
            case "boolean":
                encoder = this.buildBooleanEncoder(schema);
                break;
            case "number":
                encoder = this.buildNumberEncoder(schema);
                break;

            case "object":
                encoder = this.buildObjectEncoder(schema);
                break;
            case "string":
                encoder = this.buildStringEncoder(schema);
                break;
            case "array":
                encoder = this.buildArrayEncoder(schema);
                break;
        }
        schema.storage.set("serializer", encoder);
        return encoder;
    }
}
