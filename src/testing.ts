import { AsyncLocalStorage } from "async_hooks";
import Schematica from "./Schematica";
const json = new Schematica()

const countrySchema = json.createSchema({
    type: "object",
    name: "country",
    required: ["shorthand", "name", "dialCode", "language"],
    properties: {
        shorthand: "string",
        name: "string",
        language: "string",
        dialCode: "string",
    },
    strict: true
})

const userSchema = json.createSchema({
    type: "object",
    name: "user",
    required: ["first name", "age", "email"],
    properties: {
        "first name": {
            type: "string"
        },
        age: {
            type: "number"
        },
        email: {
            type: "string",
        },
        country: "$country"
    },
    strict: true
});


const encoder = json.buildSerializer(userSchema)
const countryEncoder = json.buildSerializer(countrySchema)

const data = {
    "first name": "Samir",
    age: 18,
    email: "hello@world.com",
    country: {
        shorthand: "IRL",
        name: "Ireland",
        language: "Irish",
        dialCode: "+353"
    }
}
const data2 = {
    shorthand: "IRL",
    name: "Ireland",
    language: "Irish",
    dialCode: "+353"
}


const iterations = 1000000



let before = process.hrtime()
for(let i = 0; i<iterations;i++){
    encoder(data)
}
let diff = process.hrtime(before)
console.log("User Enoding took", ((diff[0] * 1000 + diff[1] / 1000000)*1000000)/iterations, "ns")

before = process.hrtime()
for(let i = 0; i<iterations;i++){
    countryEncoder(data2)
}
diff = process.hrtime(before)
console.log("Country Enoding took", ((diff[0] * 1000 + diff[1] / 1000000)*1000000)/iterations, "ns")

// before = process.hrtime()
// for(let i = 0; i<iterations;i++){
//     parser(dataJson)
// }
// diff = process.hrtime(before)
// console.log("Parsing took", ((diff[0] * 1000 + diff[1] / 1000000)*1000000)/iterations, "ns")

// before = process.hrtime()
// for(let i = 0; i<iterations;i++){
//     validator(data)
// }
// diff = process.hrtime(before)
// console.log("Validating took", ((diff[0] * 1000 + diff[1] / 1000000)*1000000)/iterations, "ns")













// Dont exit ts-node-dev
while(true){}