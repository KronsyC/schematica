import { StringSchema } from './../Schemas/_StringSchema';
import Validator from "../Validator/Validator";
import { BooleanSchema, GenericSchema, NumberSchema, ObjectSchema } from "../..";
interface EncoderOpts {
    validator?: Validator;
}
export default class Encoder {
    private validator;
    constructor(opts?: EncoderOpts);
    buildJson(object: any, schema: ObjectSchema): string;
    getValidator(schema: GenericSchema): (data: unknown, shallow?: boolean) => boolean;
    buildObjectEncoder(schema: ObjectSchema): (data: unknown) => string;
    buildBooleanEncoder(schema: BooleanSchema): (data: unknown) => string;
    buildNumberEncoder(schema: NumberSchema): (data: unknown) => string;
    buildStringEncoder(schema: StringSchema): (data: unknown) => string;
    build(schema: GenericSchema): (data: unknown) => string;
}
export {};
