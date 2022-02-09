"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
function createSchema(constructor) {
    switch (constructor.type) {
        case "string":
            return new _1.StringSchema(constructor);
        case "boolean":
            return new _1.BooleanSchema(constructor);
        case "number":
            return new _1.NumberSchema(constructor);
        case "object":
            return new _1.ObjectSchema(constructor);
        case "null":
            return new _1.NullSchema(constructor);
    }
}
exports.default = createSchema;
