import Validator from "../Validator/Validator";
import { BooleanSchema, GenericSchema, NumberSchema, ObjectSchema, StringSchema } from "../../Schemas";
import getValidator from "../Validator/getValidator";
import EncoderBuilder from "./EncoderBuilder";

interface EncoderOptions {
    validator?: Validator;
}
export interface BuildEncoderOptions{
    /**
     * *[ OBJECT / ARRAY ]*   
     * Should the encoder throw an error if an unexpected   
     * property is encountered, or silently skip it
     */
    onAdditionalProperty?: "error" | "skip"
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

    build(schema: GenericSchema, opts:BuildEncoderOptions = {}) {
        let encoder;
        const throwsErrors = opts.onAdditionalProperty==="skip"?false:true
        encoder = this.encoderBuilder.build(schema, {additionalPropertyErrors: throwsErrors});
        schema.cache.set("serializer", encoder);
        return encoder;
    }
}
