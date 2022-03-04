import Schematica from "./Schematica";

const json = new Schematica();

const sch = json.createSchema({
    type: "number",
    nullable: true,
});

const validator = json.buildValidator(sch, { errors: true });
const encoder = json.buildSerializer(sch, { onAdditionalProperty: "error" });
const parser = json.buildParser(sch);
const normalizer = json.buildNormalizer(sch);
const data = "abc123"

//@ts-expect-error
console.log(validator(data));

while (true) {}
