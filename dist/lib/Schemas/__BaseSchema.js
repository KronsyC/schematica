"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSchema = void 0;
class BaseSchema {
    type;
    name;
    template;
    cache = new Map();
    constructor(template) {
        this.type = template.type;
        this.name = template.name;
        this.template = template;
    }
    validateSchema() { }
}
exports.BaseSchema = BaseSchema;
