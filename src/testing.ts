import Schematica from "./Schematica";


const json = new Schematica();

const sch = json.createSchema({
    type: "object",
    required: "all",
    name: "user",
    properties: {
        id: "number",
        name: {type: "string", maxLength: 42, minLength: 3},
        email: "string",
        password: "string"
    },
    strict: true,
});

const validator = json.buildValidator(sch, {errors: true})
const encoder = json.buildSerializer(sch, {onAdditionalProperty: "error"})
const parser = json.buildParser(sch)
const normalizer = json.buildNormalizer(sch)
const data = {
  id: 1,
  name: "Kronsy",
  email: "john@doe.com",
  password: "abc123",
}

const encoded = JSON.stringify(data)


console.log(validator(data));
console.log(encoder(data));
console.log(normalizer(data));
console.log(parser(encoded));










while (true) {}
