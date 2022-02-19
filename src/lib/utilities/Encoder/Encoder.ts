import Validator from "../Validator/Validator";
import { BooleanSchema, GenericSchema, NumberSchema, ObjectSchema, StringSchema } from "../../Schemas";
import getValidator from "../helpers/getValidator";
import objectEncoder from "./objectEncoder";
import EncoderBuilder from "./EncoderBuilder";

interface EncoderOpts {
    validator?: Validator;
}

/**
 * Transforms JS objects, numbers, booleans, etc. into strings
 */
export default class Encoder {
    private validator: Validator;
    private encoderBuilder:EncoderBuilder
    constructor(opts: EncoderOpts = {}) {
        opts.validator
            ? (this.validator = opts.validator)
            : (this.validator = new Validator());
        this.encoderBuilder = new EncoderBuilder(this.validator)
        
    }





    build(schema: GenericSchema) {
        let encoder;
        encoder = this.encoderBuilder.buildEncoder(schema);
        schema.cache.set("serializer", encoder);
        return encoder;
    }
}
