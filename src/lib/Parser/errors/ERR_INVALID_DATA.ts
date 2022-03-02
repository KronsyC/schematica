import { SchematicaError } from "src/Schematica"

export class ERR_INVALID_DATA extends Error{
    error: SchematicaError
    constructor(message:string="The data does not match the schema", error:SchematicaError){
        super(message)
        this.name="ERR_INVALID_DATA"
        this.error = error
    }
}