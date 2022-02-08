import {BaseSchema, BaseSchemaTemplate} from './__BaseSchema';
import { GenericSchema, GenericSchemaTemplate } from './Schema';
import newSchema from '.';

export interface ObjectSchemaTemplate extends BaseSchemaTemplate{
    type: "object";
    additionalProperties?:boolean;
    required?:string[];
    properties: { [x:string]:GenericSchemaTemplate }
}

export class ObjectSchema extends BaseSchema<ObjectSchemaTemplate>{
    additionalProperties:boolean;
    required:string[]
    properties:Map<string, GenericSchema> = new Map()
    constructor(template:ObjectSchemaTemplate){
        super(template)
        this.additionalProperties=template.additionalProperties||false
        this.required=template.required||[]

        // Convert template properties into actual Schemas
        for( let [key, value] of Object.entries(template.properties)){
            this.properties.set(key, newSchema(value))
        }

        

        this.validateSchema()
    }

    override validateSchema(): void {
        
    }
}