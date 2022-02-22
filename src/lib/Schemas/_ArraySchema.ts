
import { BaseSchema, BaseSchemaTemplate } from "./__BaseSchema";
import { GenericSchema, GenericSchemaTemplate } from "./Schema";
import newSchema, { getPresetByName, SchemaType } from ".";
import ERR_UNKNOWN_REF from "../../errors/Schematica/ERR_UNKNOWN_REF";
import {Presets} from ".";
import ERR_INVALID_RANGE from "./errors/ERR_INVALID_RANGE";



export interface ArraySchemaTemplate extends BaseSchemaTemplate {
    type: "array";
    items: (string|GenericSchemaTemplate)[] // Schema Template , Generic Type, or Ref
    strict?:boolean;
    minSize?:number;
    maxSize?:number;
}


export class ArraySchema extends BaseSchema<ArraySchemaTemplate> {
    items = new Set<GenericSchema>()
    strict: boolean;
    minSize:number;
    maxSize:number;
    typecheck: string = `(typeof ${this.id} === "object" &&Array.isArray(${this.id}))`
    constructor(
        template: ArraySchemaTemplate,
        schemaRefStore: Map<string, GenericSchema>
    ) {
        super(template);
        this.strict = template.strict || true
        this.minSize=template.minSize||0
        this.maxSize=template.maxSize||Number.MAX_SAFE_INTEGER
        // Convert template properties into actual Schemas or do a lookup if it is a ref
        if(template.items){
            template.items.forEach(value => {
                if(typeof value === "string" && value.startsWith("$")){
                    const schema = schemaRefStore.get(value.slice(1))
                    if(schema){
                        this.items.add(schema)
                    }
                    else{
                        throw new ERR_UNKNOWN_REF(`Could not find the ref ${value}`)
                    }
                }
                else if(typeof value === "string"){
                    this.items.add(getPresetByName(value))
                }
                else{
                    this.items.add(newSchema(value, schemaRefStore))
                }
            })
        }

        this.validateSchema();
    }

    override validateSchema(): void {
        if(this.maxSize-this.minSize<0){
            throw new ERR_INVALID_RANGE("minSize cannot be greater than maxSize")
        }
        else if (this.minSize<0){
            throw new ERR_INVALID_RANGE("minSize must be greater or equal to 0")
        }
        else if (this.maxSize<0){
            throw new ERR_INVALID_RANGE("maxSize must be greater or equal to 0")
        }
        if(this.items.size === 0){
            throw new Error("You must define at least one key type in an array schema")
        }
    }
}
