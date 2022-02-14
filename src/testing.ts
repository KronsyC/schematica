import { Presets } from ".";
import Schematica from "./Schematica";
const json = new Schematica()

const userSchema = json.createSchema({
    type: "object",
    required: ["age", "name"],
    properties: {
        name: {
            type: "string",
            maxLength: 42,
            minLength: 5
        },
        age: {
            type: "number",
            min: 18,
            max: 100
        }
    }
})

const validator = json.buildValidator(userSchema)
// console.log(validator.toString());

const data = {name:"Samir", age: 18}



const before = process.hrtime()

let iterations = 1000000
for(let i = 0; i<iterations;i++){
    validator(data)
    
}
const diff = process.hrtime(before)


console.log("Enoding took", ((diff[0] * 1000 + diff[1] / 1000000)*1000000)/iterations, "ns")
// Old encoder               1000 ns
// Stringify with validate   820 ns











// Dont exit ts-node-dev
while(true){}