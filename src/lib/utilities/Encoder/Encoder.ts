import Validator from "../Validator/Validator";
import { BooleanSchema, GenericSchema, NumberSchema, ObjectSchema } from "../../Schemas";
import ERR_INVALID_DATA from './errors/ERR_INVALID_DATA';
import extractSourceFromFn from '../helpers/extractSourceFromFn';

interface EncoderOpts {
    validator?: Validator;
}

/**
 * Transforms JS objects, numbers, booleans, etc. into strings
 */
export default class Encoder {
    private validator: Validator;
    constructor(opts: EncoderOpts = {}) {
        opts.validator
            ? (this.validator = opts.validator)
            : (this.validator = new Validator());
    }

    getValidator(schema: GenericSchema): (data: unknown) => boolean {
        let validator = schema.cache.get("validator");
        if (!validator) {
            validator = this.validator.build(schema);
        }
        return validator;
    }
    buildNumberEncoder(schema: NumberSchema): (data: unknown) => string {
        const validator:Function = this.getValidator(schema)

        const source = extractSourceFromFn(validator)
        console.log(source);
        
        const fn = new Function("data", `
        
        `)
        return (data:unknown)=>"NU"
    }

    // buildObjectEncoder(schema: ObjectSchema): (data: unknown) => string {
    // }
    // buildBooleanEncoder(schema: BooleanSchema): (data: unknown) => string {

    // }

    // buildStringEncoder(schema: StringSchema): (data: unknown) => string {

    // }

    build(schema: GenericSchema) {
        let encoder;
        switch (schema.constructor) {
            case NumberSchema:
                encoder = this.buildNumberEncoder(schema as NumberSchema);
                break;

            default:
                throw new Error(`No encoder exists for type ${schema.constructor.name}`)
        }
        schema.cache.set("serializer", encoder);
        return encoder;
    }
}
