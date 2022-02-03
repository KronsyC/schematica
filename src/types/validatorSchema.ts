import {
    Schema,
    StringSchema,
    ArraySchema,
    ObjectSchema,
    BooleanSchema,
    NumberSchema
} from "./schemas"

export type VSchema = Schema
export interface StringVSchema extends StringSchema{}
export interface NumberVSchema extends NumberSchema{}
export interface BooleanVSchema extends BooleanSchema{}
export interface ArrayVSchema extends ArraySchema{}
export interface ObjectVSchema extends ObjectSchema{}
