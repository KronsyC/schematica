import JSONworks from "./JSONworks";
const jw = new JSONworks()



const userSchema = jw.createSchema({
    type: "object",
    required: ["password"],
    properties: {
        username: {
            type: "string",
            minLength: 5,
            maxLength: 48
        },
        email: {
            type: "string"
        },
        password: {
            type: "string",
            minLength: 6,
            maxLength: 72
        }
    }
})

const userValidator = jw.buildValidator(userSchema)

console.log(userValidator({
    username: "KronsyC",
    email: "kronsycanty@gmail.com",
    password: "abc123"
}));







// Dont exit ts-node-dev
while(true){}