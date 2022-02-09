import { GenericSchema } from '../..';
import { BooleanSchema, NumberSchema, ObjectSchema, StringSchema } from "../Schemas";
declare class ValidatorBuilder {
    buildStringValidator(schema: StringSchema): (data: unknown) => boolean;
    buildNumberValidator(schema: NumberSchema): (data: unknown) => boolean;
    buildObjectValidator(schema: ObjectSchema): (data: unknown, shallow?: boolean) => boolean;
    buildBooleanValidator(schema: BooleanSchema): (data: unknown) => boolean;
    build(schema: GenericSchema): (data: unknown, shallow?: boolean) => boolean;
}
declare const kBuilder: unique symbol;
export default class Validator {
    [kBuilder]: ValidatorBuilder;
    constructor();
    build(schema: GenericSchema): (data: unknown, shallow?: boolean | undefined) => boolean;
}
export {};
