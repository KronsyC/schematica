import genId from "../utilities/helpers/genCodeSafeId";

//TYPEADDITION
export type SchemaType =
    | "string"
    | "object"
    | "number"
    | "boolean"
    | "array"
    | "null"
    | "any";
export interface BaseSchemaTemplate{
    type: SchemaType;
    name?: string;
}
/**
 * The Class from which all schemas are based from
 * T is the template Type
 */

export class BaseSchema<T extends BaseSchemaTemplate> {
    type: SchemaType;
    /**
     * The name of the schema, used to reference it in other schemas
     */
    name: string;
    /**
     * The Template from which the schema is derived
     */
    template: T;
    /**
     * A kvp for different utils to persist data
     */
    cache: Map<string, any> = new Map()

    constructor(template:T){
        this.type = template.type
        this.template = template

        if(template.name){
            this.name = "sch_"+template.name
        }
        else{
            // Randomly generated string as name, this can be used as a unique arg name for functions and the sort
            this.name = "sch_"+genId(6)


            
        }
    }

    validateSchema(){}
}
