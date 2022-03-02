import Schematica from "./Schematica";

const json = new Schematica();

const sch = json.createSchema({
    type: "object",
    required: ["name", "age"],
    properties: {
        age: {
            type: "number",
            min: 12,
            max: 15,
        },
        name: {
            type: "string",
            minLength: 3,
            maxLength: 42,
        },
    },
    strict: true,
});

const validator = json.buildValidator(sch, { errors: true });
const encoder = json.buildSerializer(sch, { onAdditionalProperty: "error" });
const parser = json.buildParser(sch);
const normalizer = json.buildNormalizer(sch);
const data = {
  name: "Sam",
  age: 18445
};


// const parsed = parser(encoded)
console.log(validator(data));

while (true) {}
