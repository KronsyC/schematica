"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectSchema = void 0;
const __BaseSchema_1 = require("./__BaseSchema");
const _1 = __importDefault(require("."));
class ObjectSchema extends __BaseSchema_1.BaseSchema {
    additionalProperties;
    required;
    properties = new Map();
    constructor(template) {
        super(template);
        this.additionalProperties = template.additionalProperties || false;
        this.required = template.required || [];
        for (let [key, value] of Object.entries(template.properties)) {
            this.properties.set(key, (0, _1.default)(value));
        }
        this.validateSchema();
    }
    validateSchema() {
    }
}
exports.ObjectSchema = ObjectSchema;
