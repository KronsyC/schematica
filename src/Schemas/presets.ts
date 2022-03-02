
import newSchema, { AnySchema, ArraySchema, BooleanSchema, NumberSchema, ObjectSchema, StringSchema } from ".";

export class Presets{
    //TYPEADDITION
    // Use getters and instantiate presets, because pregenerated presets cause ID collisions
    static get string(){
        return new StringSchema({type: "string"})
    }
    static get number(){
        return new NumberSchema({type: "number"})
    }
    static get boolean(){
        return new BooleanSchema({type: "boolean"})
    }
    static get object(){
        return new ObjectSchema({type: "object", strict: false}, new Map())
    }
    static get array(){
        return new ArraySchema({type: "array", strict: false, items: ["any"]}, new Map())
    }
    static get any(){
        return new AnySchema({type: "any"})
    }
}