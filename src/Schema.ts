import ERR_INVALID_RANGE from "./errors/schema/ERR_INVALID_RANGE";
import ERR_MALFORMED_NAME from "./errors/schema/ERR_MALFORMED_NAME";
import ERR_MISSING_REQUIRED_PROPERTY from "./errors/schema/ERR_MISSING_REQUIRED_PROPERTY";
import { SchemaType } from "./types/schemas";
import { Schema as SchemaT } from "./types/schemas";

export default class Schema {
    type: SchemaType;
    name?: string;
    schema: SchemaT;
    validator?: (data:unknown)=>boolean;
    properties:Map<string, Schema> = new Map()
    keys: Schema[] = []
    storage: Map<string, any>=new Map()
    constructor(opts: SchemaT) {
        this.name = opts.name;
        this.type = opts.type;
        this.schema = opts;

        if(this.schema.type==="object"){
            for(let [key, value] of Object.entries(this.schema.properties)){
                const sch = new Schema(value)
                this.properties.set(key, sch)
                
            }
        }
        else if (this.schema.type==="array"){
            if(Array.isArray(this.schema.keys)){
                this.schema.keys.forEach(k => {
                    this.keys.push(new Schema(k));
                })
            }
            else
            {
                this.keys.push(new Schema(this.schema));
            }
        // Validate the schema, throws errors if anything went wrong
        // Offloads validation logic from the rest of the program
        this.validate();
    }

    private validate() {
        const schema = this.schema;
        if(schema.name&&schema.name.includes(" ")){
            throw new ERR_MALFORMED_NAME()
        }
        switch (schema.type) {
            case "string":
                
                if (
                    ((schema.maxLength||(schema.minLength||-1)+1) - ( schema.minLength||0 ) < 0)||
                    (schema.minLength && schema.minLength < 0) ||
                    (schema.maxLength && schema.maxLength < 0)
                ) {
                    // Invalid range was provided, i.e min greater than max or anything less than 0
                    throw new ERR_INVALID_RANGE();
                }
                break;
            case "number":
                if (
                    (schema.max &&
                        schema.min &&
                        !(schema.max - schema.min >= 0))
                ) {
                    // Invalid range was provided, i.e min greater than max
                    throw new ERR_INVALID_RANGE();
                }
                break;
            case "boolean":
                // No validation logic for boolean schemas
                break;
            case "object":
                if(schema.required){
                    const properties = Object.keys(schema.properties)
                    for(let key of schema.required){
                        if(!properties.includes(key)){
                            throw new ERR_MISSING_REQUIRED_PROPERTY(`The key ${key} is marked as required but not defined in the schema`)
                        }
                    }
                }
                break;
            case "array":
                if (
                    // Hacky but works
                    ((schema.maxLength||((schema.minLength||-1)+1)) - ( schema.minLength||0 ) < 0)||
                    (schema.minLength && schema.minLength < 0) ||
                    (schema.maxLength && schema.maxLength < 0)
                ) {
                    // Invalid range was provided, i.e min greater than max or anything less than 0
                    throw new ERR_INVALID_RANGE();
                }
                // Arrays are relatively dumb and currently
                // don't need schema validation
                break;
        }

    }
}
