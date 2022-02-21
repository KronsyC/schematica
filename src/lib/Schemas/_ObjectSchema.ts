
import { BaseSchema, BaseSchemaTemplate } from "./__BaseSchema";
import { GenericSchema, GenericSchemaTemplate } from "./Schema";
import newSchema, { getPresetByName, SchemaType } from ".";
import ERR_UNKNOWN_REF from "../../errors/Schematica/ERR_UNKNOWN_REF";
import {Presets} from ".";



export interface ObjectSchemaTemplate extends BaseSchemaTemplate {
    type: "object";
    strict?: boolean;
    required?: string[];
    properties?: { [x: string]: GenericSchemaTemplate | SchemaType | string };
}


export class ObjectSchema extends BaseSchema<ObjectSchemaTemplate> {
    strict:boolean;
    required: string[];
    properties: Map<string, GenericSchema> = new Map();
    constructor(
        template: ObjectSchemaTemplate,
        schemaRefStore: Map<string, GenericSchema>
    ) {
        super(template);
        this.strict = template.strict || false;
        this.required = template.required || [];

        // Convert template properties into actual Schemas
        if(template.properties){
            for (let [key, value] of Object.entries(template.properties)) {
                // If the value is a string and starts with $, i.e a ref
                if (typeof value === "string" && value.startsWith("$")) {
                    const schemaName = value.slice(1);
                    const sch = schemaRefStore.get(schemaName);
                    if (sch) {
                        this.properties.set(key, sch);
                    } else {
                        throw new ERR_UNKNOWN_REF();
                    }
                } else if (typeof value === "string") {
                    // TODO: Create a Generic Version of the type's schema
                    const schema = getPresetByName(value)
                    this.properties.set(key, schema)
                } else {
                    this.properties.set(key, newSchema(value, schemaRefStore));
                }
            }
        }

        this.validateSchema();
    }

    override validateSchema(): void {
        this.required.forEach(r=> {
            if(!Array.from(this.properties.keys()).includes(r)){
                throw new Error(`${r} is required but not defined by the schema`)
            }
        })
    }
}
