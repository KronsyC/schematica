
import { BaseSchema, BaseSchemaTemplate } from "./__BaseSchema";
import { GenericSchema, GenericSchemaTemplate } from "./Schema";
import newSchema, { ArraySchema, getPresetByName, SchemaType } from ".";
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
    typecheck: string = `(!!${this.id} && typeof ${this.id} === "object" && !Array.isArray(${this.id}))`
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
                    schema.name = key
                    this.properties.set(key, schema)
                } else {
                    
                    if(!value.name)value.name = key
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

    /**
     * This is an empty object initialization used to optimize v8 (static shape)
     */
    get structure(){
        let code = "{"
        this.properties.forEach((v, k) => {
            if(v instanceof ObjectSchema){
                // Recursively generate structure
                code+=`"${k}":${v.structure}`
            }
            else{
                code+=`"${k}":undefined`
            }
        })
        code += "}"
        return code
    }

    /**
     * Get all the types contained within the schema (deep)
     */
    get allTypes():SchemaType[]{
        const types:SchemaType[] = []
        this.properties.forEach(value => {
            if(!types.includes(value.type)){
                types.push(value.type)
            }
            if(value instanceof ObjectSchema || value instanceof ArraySchema){
                types.push(...value.allTypes.filter(t=>!types.includes(t)))
            }
        })
        return types
    }
    // Returns all children mapped by their context, i.e {"country.name": SCHEMA}
    get allChildren(){
        const children:{[x:string]:GenericSchema} = {}
        this.properties.forEach( (item, name) => {
            const label = item.template.name?item.name:name
            children[label] = item
            if(item instanceof ObjectSchema || item instanceof ArraySchema){
                const nested=  item.allChildren
                for(let key in nested){
                    const value = nested[key]
                    
                    children[label+"."+key] = value
                }
            }
        })
        
        return children
    }
}
