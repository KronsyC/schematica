import { type TextEncoding } from './types';
interface SchemaTic{
    /**
     * The data type that the schema represents
     */
    type: SchemaType;
    /**
     * The name that the schema will be referenced as
     */
    name?:string;
}

export interface ObjectSchema extends SchemaTic {
    type: 'object';
    additionalProperties?: boolean;
    required?: string[];
    properties: {
        [key: string]: Schema;
    };
}
export interface StringSchema extends SchemaTic {
    type: 'string';
    /**
     * The maximum length of the string
     */
    maxLength?: number;
    /**
     * The minimum length of the string
     */
    minLength?: number;

    /**
     * Should excess whitespace be trimmed before validation
     */
    trim?:boolean;
    /**
     * Remove all characters that are not supported by the encoding    
     * defaults to ascii
     */
    encoding?: TextEncoding
}
export const defaultStringSchema:StringSchema = {
    type: "string",
    minLength: 0,
    maxLength:undefined,
    trim: false,
    encoding: "unicode"
}

export interface NumberSchema extends SchemaTic {
    type: 'number';
    /**
     * The maximum value of the number
     */
    max?: number;
    /**
     * The minimum value of the number
     */
    min?: number;
    /**
     * If this value is enabled, also accepts strings containing a number
     */
    casting?:boolean;
}
export interface ArraySchema extends SchemaTic {
    type: 'array';
    minLength?: number;
    maxLength?: number;
    keys: Schema[];
}
export interface BooleanSchema extends SchemaTic {
    type: 'boolean';
}

export type Schema =
    | ObjectSchema
    | StringSchema
    | NumberSchema
    | ArraySchema
    | BooleanSchema;

export type SchemaType = 'boolean'|"number"|"string"|"array"|"object"