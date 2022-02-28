import Schematica from "./Schematica";


const json = new Schematica();

const sch = json.createSchema({
    type: "object",
    required: "all",
    name: "user",
    properties: {
        id: "number",
        name: "string",
        email: "string",
        password: "string"
    },
    strict: true,
});

const encoder = json.buildSerializer(sch, {onAdditionalProperty: "skip"})
const data = {
  id: 1,
  name: "John Doe",
  email: "john@doe.com",
  password: "abc123",
  unknown:"test"
}


console.log(encoder(data))



while (true) {}
