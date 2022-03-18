import Schematica from "./Schematica";

const json = new Schematica();

const sch = json.createSchema({
    type: "any",
    nullable: true,
});

const validator = json.buildValidator(sch, { errors: true });
const encoder = json.buildSerializer(sch, { onAdditionalProperty: "error" });
const parser = json.buildParser(sch);
const normalizer = json.buildNormalizer(sch);
const data = ""
console.log(sch);

console.log(validator(data));

while (true) {}
