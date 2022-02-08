import { presets, Schema } from ".";
import JSONworks from "./JSONworks";
import { Encoder } from ".";

const jw = new JSONworks()

const userSchema = jw.createSchema({
    type: "object",
    required: ["name", "age", "PII"],
    properties: {
        name: {
            type: "string"
        },
        age: {
            type: "number"
        },
        PII: {
            type: "object",
            required: ["email", "password"],
            properties: {
                email: {
                    type: "string"
                },
                password: {
                    type: "string"
                }
            }
        }
    }
})
const data = {
    name: "Samir",
    age: 17,
    PII: {
        email: "abc",
        password: "def",
    }
}
const encoder = jw.buildSerializer(userSchema)
let encoded;
console.time("encode")
for(let i = 0; i<=10000;i++){
    encoded = encoder(data);
}
console.timeEnd("encode")

console.log(encoded);









// Dont exit ts-node-dev
while(true){}