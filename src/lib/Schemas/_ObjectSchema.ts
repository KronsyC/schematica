import {BaseSchema, BaseSchemaTemplate} from './__BaseSchema';
import { GenericSchema, GenericSchemaTemplate } from './Schema';
import newSchema from '.';
import ERR_UNKNOWN_REF from '../../errors/JSONworks/ERR_UNKNOWN_REF';

export interface ObjectSchemaTemplate extends BaseSchemaTemplate{
    type: "object";
    additionalProperties?:boolean;
    required?:string[];
    properties: { [x:string]:GenericSchemaTemplate|string }
}

export class ObjectSchema extends BaseSchema<ObjectSchemaTemplate>{
    additionalProperties:boolean;
    required:string[]
    properties:Map<string, GenericSchema> = new Map()
    constructor(template:ObjectSchemaTemplate, schemaRefStore:Map<string, GenericSchema>){
        super(template)
        this.additionalProperties=template.additionalProperties||false
        this.required=template.required||[]

        // Convert template properties into actual Schemas
        for( let [key, value] of Object.entries(template.properties)){
            // If the value is a string and starts with $, i.e a ref
            if(typeof value === "string" && value.startsWith("$")){
                const schemaName = value.slice(1)
                const sch = schemaRefStore.get(schemaName)
                if(sch){
                    this.properties.set(key, sch)
                }
                else{
                    throw new ERR_UNKNOWN_REF()
                }
                
            }
            else if (typeof value === "string"){
                // TODO: Create a Generic Version of the type's schema
                throw new Error("A Ref must follow the pattern $schemaName, generic type schemas are yet to be implemented")
            }
            else{
                this.properties.set(key, newSchema(value))
            }
        }

        

        this.validateSchema()
    }

    override validateSchema(): void {
        
    }
}