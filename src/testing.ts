import JSONworks from "./JSONworks";

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const jw = new JSONworks()



const userSchema = jw.createSchema({
    type: "object",
    name: "user",
    additionalProperties: true,
    properties:{ 
        username: {
            type: "string",
            encoding: "ascii",
            trim: true,
            match: emailRegex
        },
        password: {
            type: "string"
        }
    }
})

console.log(jw.buildValidator(userSchema)({
    username: "samir@mail.net",
    password: "helloWorld"
}))
// Dont exit ts-node-dev
while(true){}