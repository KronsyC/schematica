import { presets, Schema } from ".";
import JSONworks from "./JSONworks";
import { Encoder } from ".";

const jw = new JSONworks()


const userSchema = jw.createSchema(
    {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
            username: {
                type: "string",
                minLength: 5,
                maxLength: 45
            },
            password: {
                type: "string",
                minLength: 6,
                maxLength: 72
            },
            email: {
                type: "string",
                match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            }
        }
})

const userValidator = jw.buildValidator(userSchema)

console.log(userValidator({
    username: "Samir",
    password: "abc123",
    email: "example@example.com"
}));




// Dont exit ts-node-dev
while(true){}