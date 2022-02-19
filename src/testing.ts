import Schematica from "./Schematica";
const json = new Schematica()

const userSchema = json.createSchema({
    type: "object",
    required: ["name", "age", "email"],
    properties: {
        name: {
            type: "string"
        },
        age: {
            type: "number"
        },
        email: {
            type: "string",
        }
    },
    strict: false
});

const encoder = json.buildSerializer(userSchema)


const data = {
    name: "Samir",
    age: 18,
    email: "Hello@World.com",
    peepee: "poopoo"
}


const iterations = 10000000


console.log(encoder.toString());

let before = process.hrtime()
for(let i = 0; i<iterations;i++){
    encoder(data)
}
let diff = process.hrtime(before)
console.log("Enoding took", ((diff[0] * 1000 + diff[1] / 1000000)*1000000)/iterations, "ns")

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