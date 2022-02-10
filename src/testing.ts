import Schematica from "./Schematica";
const json = new Schematica()


const userSchema = json.createSchema({
    type: "object",
    required: ["username", "password", "age"],
    properties: {
        username: "string",
        password: "string",
        age: "number",

    },
    additionalProperties: true
})
const userValidator = json.buildSerializer(userSchema)


console.log(userValidator({
    username: "Samir",
    password: "abcd",
    age: 13.6

}));









// Dont exit ts-node-dev
while(true){}