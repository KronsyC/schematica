"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __BaseSchema_1 = require("./lib/Schemas/__BaseSchema");
const Validator_1 = __importDefault(require("./lib/Validator/Validator"));
const ERR_UNKNOWN_REF_1 = __importDefault(require("./errors/JSONworks/ERR_UNKNOWN_REF"));
const Encoder_1 = __importDefault(require("./lib/Encoder/Encoder"));
const Schemas_1 = __importDefault(require("./lib/Schemas"));
const kValidator = Symbol("Validator");
const kParser = Symbol("Parser");
const kEncoder = Symbol("Encoder");
const kSchemaRefStore = Symbol("Schema Store");
class JSONworks {
    [kSchemaRefStore] = new Map();
    [kValidator];
    [kEncoder];
    constructor() {
        this[kValidator] = new Validator_1.default();
        this[kEncoder] = new Encoder_1.default();
    }
    addSchema(schema) {
        let sc;
        if (schema instanceof __BaseSchema_1.BaseSchema) {
            sc = schema;
        }
        else {
            sc = this.createSchema(schema);
        }
        if (sc.name) {
            if (sc.name.includes(" ")) {
                throw new Error("Schema names cannot contain whitespace").name = "ERR_INVALID_SCHEMA_REF";
            }
            this[kSchemaRefStore].set(sc.name, sc);
        }
        return sc;
    }
    createSchema(schema) {
        return (0, Schemas_1.default)(schema);
    }
    getSchema(ref) {
        const schema = this[kSchemaRefStore].get(ref);
        if (schema) {
            return schema;
        }
        else {
            throw new ERR_UNKNOWN_REF_1.default();
        }
    }
    buildValidator(arg) {
        if (typeof arg === "string") {
            return this.buildValidator(this.getSchema(arg));
        }
        else if (arg instanceof __BaseSchema_1.BaseSchema) {
            return this[kValidator].build(arg);
        }
        else {
            throw new Error("The Argument passed to buildValidator was not a string or Schema").name = "ERR_INVALID_ARGS";
        }
    }
    buildSerializer(schema) {
        return this[kEncoder].build(schema);
    }
}
exports.default = JSONworks;
