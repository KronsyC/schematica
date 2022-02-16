import newSchema from ".";

export class Presets{
    static email = newSchema({
        type: "string",
    })
    //TYPEADDITION
    static string = newSchema({
        type: "string"
    })
    static number = newSchema({
        type: "number"
    })
    static boolean = newSchema({
        type: "boolean"
    })
    static object = newSchema({
        type: "object",
        strict: false
    })
    static any = newSchema({
        type: "any"
    })
}