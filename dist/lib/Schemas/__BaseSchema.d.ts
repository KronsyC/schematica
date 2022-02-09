export declare type SchemaType = "string" | "object" | "number" | "boolean" | "array" | "null";
export interface BaseSchemaTemplate {
    type: SchemaType;
    name?: string;
}
export declare class BaseSchema<T extends BaseSchemaTemplate> {
    type: SchemaType;
    name?: string;
    template: T;
    cache: Map<string, any>;
    constructor(template: T);
    validateSchema(): void;
}
