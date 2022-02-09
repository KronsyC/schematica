"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullSchema = void 0;
const _1 = require(".");
class NullSchema extends _1.BaseSchema {
    constructor(template) {
        super(template);
        this.validateSchema();
    }
    validateSchema() {
    }
}
exports.NullSchema = NullSchema;
