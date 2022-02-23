import Schematica from "./Schematica";

const json = new Schematica();

const sch = json.createSchema({
    type: "object",
    properties: {
        username: "string",
        email: "string",
    },
});

const encoder = json.buildSerializer(sch)

console.log(encoder({       
     username: "Samir",
    email: "kronsycanty@gmail.com",
}))

while (true) {}
