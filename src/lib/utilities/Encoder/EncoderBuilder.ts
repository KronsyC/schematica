import { BooleanSchema } from './../../Schemas/_BooleanSchema';
import { GenericSchema } from './../../Schemas/Schema';
import { NumberSchema, ObjectSchema, StringSchema, Validator } from "../../.."
import getValidator from "../helpers/getValidator"
import objectEncoder from "./objectEncoder";
import extractSourceFromFn from '../helpers/extractSourceFromFn';

function escaped(char:string){
    switch(char){
        case '"':
            return '\\"'
        case "\b":
            return "\\b"
        case "\\":
            return "\\\\"
        case "\f":
            return "\\f"
        case "\n":
            return "\\n"
        case "\r":
            return "\\r"
        case "\h":
            return "\\h"
        default:
            throw new Error(`Could not find escaped version for character ${char}`)
    }
}

export default class EncoderBuilder{
    private validator:Validator;
    constructor(validator:Validator){
        this.validator = validator
    }
    buildStringEncoder(schema: StringSchema): (data: string) => string {
        const validator = getValidator(schema, this.validator.builder)
        //@ts-expect-error
        return new Function(schema.name, `
        function escaped(char){
            ${extractSourceFromFn(escaped)}
        }
        try{
            let data = ${schema.name}
            ${extractSourceFromFn(validator).replace("return true;", "")}
            let i=data.length-1;
            while(i>-1){
                const char = data[i]   
                if(char==='"'|| char==="\\b" || char==="\\\\" || char==="\\f" || char==="\\n" || char==="\\r" || char==="\\h" ){                        
                    data = data.slice(0, i) + escaped(char) + data.slice(i+1)
                    i--   
                }
                i--
            }
            return '"' + data + '"'
        }
        catch(err){
            throw err
        }
        `)
    }
    buildNumberEncoder(schema: NumberSchema): (data: number) => string {
        const validator = getValidator(schema, this.validator.builder)
        //@ts-expect-error
        return new Function(schema.name, `
            ${extractSourceFromFn(validator).replace("return true", "")}
            const num = Number(${schema.name})
            return ''+num
        `)
    }
    buildBooleanEncoder(schema:BooleanSchema):(data:boolean)=>string {
        const validator= getValidator(schema, this.validator.builder);
        //@ts-expect-error
        return new Function(schema.name, `
            ${extractSourceFromFn(validator).replace("return true;", "")}
            return ${schema.name} ? "true" : "false"
        `)
    }
    buildObjectEncoder(schema: ObjectSchema): (data: object) => string {
        return objectEncoder(schema, this.validator.builder, this)
    }


    buildEncoder(schema:GenericSchema){
        switch(schema.type){
            case "string":
                return this.buildStringEncoder(schema as StringSchema);
            case "number":
                
                return this.buildNumberEncoder(schema as NumberSchema);
            case "boolean":
                return this.buildBooleanEncoder(schema as BooleanSchema);
            case "object":
                return this.buildObjectEncoder(schema as ObjectSchema)
            default:
                throw new Error(`No encoder support for type ${schema.type}}`)
        }
    }

}