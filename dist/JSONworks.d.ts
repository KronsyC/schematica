import Validator from "./lib/Validator/Validator";
import Encoder from "./lib/Encoder/Encoder";
import { GenericSchema, GenericSchemaTemplate } from ".";
declare const kValidator: unique symbol;
declare const kEncoder: unique symbol;
declare const kSchemaRefStore: unique symbol;
export default class JSONworks {
    [kSchemaRefStore]: Map<string, GenericSchema>;
    [kValidator]: Validator;
    [kEncoder]: Encoder;
    constructor();
    addSchema(schema: GenericSchema): GenericSchema;
    addSchema(template: GenericSchemaTemplate): GenericSchema;
    createSchema(schema: GenericSchemaTemplate): GenericSchema;
    getSchema(ref: string): GenericSchema;
    buildValidator(schema: GenericSchema): (data: unknown) => boolean;
    buildValidator(ref: string): (data: unknown) => boolean;
    buildSerializer(schema: GenericSchema): (data: unknown) => string;
}
export {};
