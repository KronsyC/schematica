import { Validator } from ".";




const json = new Validator()

const isValidUserData = json.addSchema({
    type: "object",
    name: "user validation",
    required: ["name", "age"],
    properties: {
        name: {
            type: "string",
            minLength: 3,
            trim: true,
            encoding: "ascii"
        },
        age: {
            type: "number",
            min: 13,
            max: Infinity,
            casting: true
        }
    }
})

console.log(isValidUserData({
    name: "KronsyC😊",
    age: Number.MAX_VALUE+1
}))

// Dont exit ts-node-dev
while(true){}