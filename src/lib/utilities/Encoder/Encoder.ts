import Validator from "../Validator/Validator";
import { BooleanSchema, GenericSchema, NumberSchema, ObjectSchema, StringSchema } from "../../Schemas";
import getValidator from "../Validator/getValidator";
import EncoderBuilder from "./EncoderBuilder";

interface EncoderOptions {
    validator?: Validator;
}
export interface BuildEncoderOptions{
    
}

/**
 * Transforms JS objects, numbers, booleans, etc. into strings
 */
export default class Encoder {
    private validator: Validator;
    private encoderBuilder:EncoderBuilder
    constructor(opts: EncoderOptions = {}) {
        this.validator = opts.validator || new Validator()
        this.encoderBuilder = new EncoderBuilder(this.validator)
        
    }

    build(schema: GenericSchema, opts:BuildEncoderOptions) {
        let encoder;
        encoder = this.encoderBuilder.build(schema);
        schema.cache.set("serializer", encoder);
        return encoder;
    }
}
