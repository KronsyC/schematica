import ERR_INVALID_RANGE from "./errors/schema/ERR_INVALID_RANGE";
import ERR_MALFORMED_NAME from "./errors/schema/ERR_MALFORMED_NAME";
import { SchemaType } from "./types/schemas";
import { Schema as SchemaT } from "./types/schemas";

export default class Schema {
    type: SchemaType;
    name?: string;
    schema: SchemaT;
    storage: Map<string, any>=new Map()
    constructor(opts: SchemaT) {
        this.name = opts.name;
        this.type = opts.type;
        this.schema = opts;

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
                    ((schema.maxLength||0) - ( schema.minLength||0 ) < 0)||
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
                // Objects are relatively dumb and currently
                // don't need schema validation
                break;
            case "array":
                // Arrays are relatively dumb and currently
                // don't need schema validation
                break;
        }

    }
}
