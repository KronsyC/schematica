import Schematica from "./Schematica";
const json = new Schematica()


const postsSchema = json.createSchema({
    type: "array",
    items: [
        {
            type: "object",
            required: ["name", "email"],
            properties: {
                name: {
                    type: "string",
                    minLength: 5,
                    maxLength: 42
                },
                email: "string"
            },
            strict: true
        }
    ],
})


const validator = json.buildValidator(postsSchema, {errors:true})
const encoder = json.buildSerializer(postsSchema)
const parser = json.buildParser(postsSchema)

const iterations = 10000000

const data = [{name: "Samir", email:"kronsycanty@gmail.com"}, {name:"Sheen", email:"sheen@ramranch.io"}]
const dataJson = JSON.stringify(data)




let before = process.hrtime()
for(let i = 0; i<iterations;i++){
    validator(data)
}
let diff = process.hrtime(before)
console.log("Validating Enoding took", ((diff[0] * 1000 + diff[1] / 1000000)*1000000)/iterations, "ns")


before = process.hrtime()
for(let i = 0; i<iterations;i++){
    let parsed = JSON.parse(dataJson)
    validator(parsed)
}
diff = process.hrtime(before)
console.log("Parsing took", ((diff[0] * 1000 + diff[1] / 1000000)*1000000)/iterations, "ns")

before = process.hrtime()
for(let i = 0; i<iterations;i++){
    encoder(data)
}
diff = process.hrtime(before)
console.log("Encoding took", ((diff[0] * 1000 + diff[1] / 1000000)*1000000)/iterations, "ns")













// Dont exit ts-node-dev
while(true){}