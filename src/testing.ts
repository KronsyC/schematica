import JSONworks from "./JSONworks";
const jw = new JSONworks()

const userSchema = jw.addSchema({
    type: "object",
    name:"user",
    required: ["username", "email", "password", "age"], // Validators check if all of these properties are present
    properties: {
        username: {
            type: "string",
            minLength: 3, // String minLength and maxLength values are inclusive
            maxLength: 42
        },
        email: {
            type: "string",
            match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ // Strings are able to use regex
        },
        password: {
            type: "string",
            minLength: 6,
            maxLength: 72
        },
        age: {
            type: "number",
            min: 18 
        }
    }
})

const messageSchema = jw.createSchema({
    type: "object",
    required: ["author", "id"],
    properties: {
        id: {
            type: "number"
        },
        author: "$user"
    }
})

const messageValidator = jw.buildValidator(messageSchema)

console.log(messageValidator({
    id: 1,
    author: {
        username: "Casey",
        email: "casey@example.com",
        password: "abc123",
        age: 123
    }
}));

console.log(JSON.stringify({
    id: 1,
    author: {
        username: "John Doe",
        email: "john@doe.com",
        age: 27
    },
    content: "Hello Everyone! My name is John Doe and I love cats"
}));




// Dont exit ts-node-dev
while(true){}