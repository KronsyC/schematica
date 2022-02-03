import { SchemaType } from "./types/schemas";
import { VSchema } from "./types/validatorSchema";

const kBuildObjectValidator = Symbol("Build Object Validator");
const kBuildNumberValidator = Symbol("Build Number Validator");
const kBuildStringValidator = Symbol("Build String Validator");
const kBuildArrayValidator = Symbol("Build Array Validator");
const kBuildBooleanValidator = Symbol("Build Boolean Validator");

export default class Schema {
    type: SchemaType;
    name?:string;
    schema: VSchema;
    cachedValidator?:(data:any)=>boolean;
    constructor(opts: VSchema) {
        this.name=opts.name
        this.type = opts.type;
        this.schema = opts;
    }
}
