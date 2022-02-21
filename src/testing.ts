import Schematica from "./Schematica";
const json = new Schematica()


const userSchema = json.createSchema({
    type: "object",
    name: "user",
    required: ["name", "age", "email"],
    properties: {
        name: "string",
        age: "number",
        email: "string"
    },
    strict: true
});




const data = {
    name: "Samir",
    age: 18,
    email: "hello@world.com"
}



const postsSchema = json.createSchema({
    type: "array",
    items: [
        {type: "string", minLength: 5},
        {type: "number", min: 16},
    ],
    minSize: 0
})



const postsvalidator = json.buildValidator(postsSchema, {errors: true})



console.log(postsvalidator([18]));

console.log(postsvalidator.toString());


const iterations = 1000000



let before = process.hrtime()
for(let i = 0; i<iterations;i++){
    postsvalidator([17, 18, 19, 16])
}
let diff = process.hrtime(before)
console.log("User Enoding took", ((diff[0] * 1000 + diff[1] / 1000000)*1000000)/iterations, "ns")


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