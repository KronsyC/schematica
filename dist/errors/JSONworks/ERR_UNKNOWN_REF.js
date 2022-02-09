"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ERR_UNKNOWN_REF extends Error {
    constructor(message = "Ref Not Found") {
        super(message);
        this.name = "ERR_UNKNOWN_REF";
    }
}
exports.default = ERR_UNKNOWN_REF;
