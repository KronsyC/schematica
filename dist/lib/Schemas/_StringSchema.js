"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringSchema = void 0;
const _1 = require(".");
const ERR_INVALID_RANGE_1 = __importDefault(require("./errors/ERR_INVALID_RANGE"));
class StringSchema extends _1.BaseSchema {
    minLength;
    maxLength;
    encoding;
    match;
    constructor(template) {
        super(template);
        this.encoding = template.encoding || "unicode";
        this.match = template.match || undefined;
        this.minLength = template.minLength || 0;
        this.maxLength = template.maxLength || Number.MAX_SAFE_INTEGER;
        this.validateSchema();
    }
    validateSchema() {
        if (this.minLength < 0) {
            throw new ERR_INVALID_RANGE_1.default("minLength must be greater or equal to 0");
        }
        else if (this.maxLength < 0) {
            throw new ERR_INVALID_RANGE_1.default("maxLength must be greater or equal to 0");
        }
        else if (this.maxLength - this.minLength < 0) {
            throw new ERR_INVALID_RANGE_1.default("minLength cannot be larger than maxLength");
        }
    }
}
exports.StringSchema = StringSchema;
