<h1 align=center> Schematica</h1>

<h3 align=center> The fully featured JSON manipulation library</h2>

## Features
- Schema validation
- Serialization
- Parsing

## Usage

### Sample User Object Validation

```ts
const Json = require("schematica").default

const jw = new Json()

const userSchema = jw.createSchema({
    type: "object",
    name: "userSchema",
    required: ["username", "email", "age"], // Validators check if all of these properties are present
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
        age: {
            type: "number",
            min: 18 
        }
    }
})

// This is the function used to validate objects
// Validators are cached so you can reuse this call without performance loss
const userValidator = jw.buildValidator(userSchema);

const example1 = {
    username: "Casey",
    email: "casey@example.com",
    age: 23
}

console.log(userValidator(example1)) // true - all properties are provided and meet their requirements

const example2 = {
    username: "Casey",
    email: "casey@example.com",
}

console.log(userValidator(example2)) // false - age is required 

const example3 = {
    username: "Casey",
    email: "casey@example.com",
    password: "password1",
    age: 18
}

console.log(userValidator(example3)) // false - password is not defined in the schema and additionalProperties isn't set
```

### Sample Message Object Encoder

```ts

const Json = require("schematica").default

const jw = new Json()

// The Key difference between createSchema and addSchema is that addSchema saves the schema with it's ref whereas createSchema doesn't
const userSchema = jw.addSchema({
    name: "userSchema",
    ........
})

const messageSchema = jw.createSchema({
    type: "object",
    required: ["id", "author", "content"],
    properties: {
        id: {
            type: "number"
        },
        author: "$userSchema",
        content: {
            type: "string",
            minLength: 32,
            maxLength: 2048
        }
    }
})

// Build a serializer function, this function takes an object and returns a string
const messageStringify = jw.buildSerializer(messageSchema)

const example1 = {
    id: 1,
    author: {
        username: "John Doe",
        email: "john@doe.com",
        age: 27
    },
    content: "Hello Everyone! My name is John Doe and I love cats"
}

console.log( messageStringify(example1) ) 
// {"id":1,"author":{"username":"John Doe","email":"john@doe.com","age":27},"content":"Hello Everyone! My name is John Doe and I love cats"}

const example2 = {
    id: 2,
    author: {
        username: "Jane Doe",
        email: "jane@doe.com",
    },
    content: "How's it going? My name is Jane and I hate cats"
}

console.log( messageStringify(example2) ) // Throws `ERR_INVALID_DATA` because the user schema is missing the property `age`

```





## Documentation
