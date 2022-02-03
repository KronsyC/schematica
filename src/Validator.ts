import ERR_UNKNOWN_REF from "./errors/ERR_UNKNOWN_REF";
import Schema from "./Schema";
import { Schema as ISchema } from "./types/schemas"
const kSchemaRefStore = Symbol("Schema Reference Store")

export default class Validator {

    // Store the scemas with their names
    [kSchemaRefStore]: Map<string, Schema> = new Map()

    addSchema(schema:Schema|ISchema){
        if(schema instanceof Schema){
            // Call the build method directly
            const name = schema.name
            if(name){
                this[kSchemaRefStore].set(name, schema)  
            }
            return schema.build()
        }
        else{
            
            // Instantiate a new Schema and build it
            const sc = new Schema(schema)
            
            if(sc.name){
                
                this[kSchemaRefStore].set(sc.name, sc)
                
            }

            
            const built = sc.build()
            
            return built
        }
    }
    getSchema(ref:string){
        if(this[kSchemaRefStore].has(ref)){
            return this[kSchemaRefStore].get(ref)
        }
        else{
            throw new ERR_UNKNOWN_REF()
        }
    }
}
