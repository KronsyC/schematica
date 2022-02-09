"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberSchema = void 0;
const _1 = require(".");
const ERR_INVALID_RANGE_1 = __importDefault(require("./errors/ERR_INVALID_RANGE"));
class NumberSchema extends _1.BaseSchema {
    min;
    max;
    constructor(template) {
        super(template);
        this.min = template.min || Number.MIN_SAFE_INTEGER;
        this.max = template.max || Number.MAX_SAFE_INTEGER;
        this.validateSchema();
    }
    validateSchema() {
        if (this.max - this.min < 0) {
            throw new ERR_INVALID_RANGE_1.default("minLength cannot be larger than maxLength");
        }
    }
}
exports.NumberSchema = NumberSchema;
