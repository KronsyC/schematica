"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JSONworks_1 = __importDefault(require("./JSONworks"));
const jw = new JSONworks_1.default();
const userSchema = jw.createSchema({
    type: "object",
    required: ["password", "username", "email"],
    properties: {
        username: {
            type: "string",
            minLength: 5,
            maxLength: 48
        },
        email: {
            type: "string",
        },
        password: {
            type: "string",
            minLength: 6,
            maxLength: 72
        },
        age: {
            type: "number",
            min: 13
        }
    },
});
const userStringify = jw.buildSerializer(userSchema);
const before2 = process.hrtime();
for (let i = 0; i < 100000; i++) {
    userStringify({
        username: "KronsyC",
        email: "kronsycanty@gmail.com",
        password: "abc123",
        age: 15
    });
}
const diff2 = process.hrtime(before2);
console.log(`Encoding custom takes an average of ${(diff2[0] * 1000 + diff2[1] / 100000) / 1000000 * 1000}µs `);
while (true) { }