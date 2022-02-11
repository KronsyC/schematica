import newSchema from ".";

export class Presets{
    static email = newSchema({
        type: "string",
        // TODO: Replace this regex with a custom validator function
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
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
        additionalProperties: true
    })
    static any = newSchema({
        type: "any"
    })
}