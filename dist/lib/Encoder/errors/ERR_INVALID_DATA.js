"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ERR_INVALID_DATA extends Error {
    constructor(message = "Data does not match schema") {
        super(message);
        this.name = "ERR_INVALID_DATA";
    }
}
exports.default = ERR_INVALID_DATA;
