import { GenericSchema } from '../../..';
import {  BooleanSchema, NumberSchema, ObjectSchema, StringSchema, TextEncoding, AnySchema } from "../../Schemas";
import ValidatorBuilder from './ValidatorBuilder';


const checkStringEncoding = (function(
    text: string,
    encoding: TextEncoding
): boolean {
    switch (encoding) {
        case "utf8":
        case "ascii":
            // 128 total character values
            for (let char of text) {
                if (char.charCodeAt(0) > 127) {
                    return false;
                }
            }
            break;
        case "unicode":
            return true // I know this is terrible and may fail, but it's optimized TODO: Make this actually check
    }
    return true;
})


const kBuilder = Symbol("Validator Builder");
export default class Validator {
    [kBuilder]: ValidatorBuilder;
    constructor() {
        this[kBuilder] = new ValidatorBuilder();
    }

    build(schema: GenericSchema) {
        return this[kBuilder].buildValidator(schema)
    }
    static default = new Validator()
}
