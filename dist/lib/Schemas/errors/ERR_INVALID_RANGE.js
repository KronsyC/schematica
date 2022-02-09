"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ERR_INVALID_RANGE extends Error {
    constructor(message = "An invalid range was provided to the schema") {
        super(message);
        this.name = "ERR_INVALID_RANGE";
    }
}
exports.default = ERR_INVALID_RANGE;
