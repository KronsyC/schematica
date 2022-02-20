import { BooleanSchema } from './../../Schemas/_BooleanSchema';
import { GenericSchema } from './../../Schemas/Schema';
import { NumberSchema, ObjectSchema, StringSchema, Validator } from "../../.."
import getValidator from "../helpers/getValidator"
import objectEncoder from "./objectEncoder";
import extractSourceFromFn from '../helpers/extractSourceFromFn';
const h_escaped = `
function escaped(char){
    switch(char){
        case '"':
            return '\\"'
        case "\\b":
            return "\\b"
        case "\\\\":
            return "\\\\\\\\"
        case "\\f":
            return "\\\\f"
        case "\\n":
            return "\\\\n"
        case "\\r":
            return "\\\\r"
        default:
            throw new Error(\`Could not find escaped version for character \${char}\`)
    }
}
`
const h_strEnc = `
`

/**
 * IF A VALIDATOR IS A CHILD VALIDATOR
 * IT EXPECTS IT'S PARENT TO PROVIDE ALL OF IT'S DEPENDENCIES AND VALIDATE FOR IT
 */
/**
 * 
 */
export default class EncoderBuilder{
    private validator:Validator;
    constructor(validator:Validator){
        this.validator = validator
    }
    buildStringEncoder(schema: StringSchema, isChild=false): (data: string) => string {
        const validator = getValidator(schema, this.validator.builder)
        //@ts-expect-error
        return new Function(schema.id, `
        ${!isChild ? h_escaped : ""}
        try{
            let data = ${schema.id}
            ${!isChild ? extractSourceFromFn(validator).replace("return true;", ""):""}
            let i=data.length-1;
            while(i>-1){
                const char = data[i]   
                if(char==='"'|| char==="\\b" || char==="\\\\" || char==="\\f" || char==="\\n" || char==="\\r" ){                        
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
    buildNumberEncoder(schema: NumberSchema, isChild=false): (data: number) => string {
        const validator = getValidator(schema, this.validator.builder)
        //@ts-expect-error
        return new Function(schema.id, `
            ${!isChild ? extractSourceFromFn(validator).replace("return true", "") : ""}
            const num = Number(${schema.id})
            return ''+num
        `)
    }
    buildBooleanEncoder(schema:BooleanSchema, isChild=false):(data:boolean)=>string {
        const validator= getValidator(schema, this.validator.builder);
        //@ts-expect-error
        return new Function(schema.id, `
            ${!isChild?extractSourceFromFn(validator).replace("return true;", ""):""}
            return ${schema.id} ? "true" : "false"
        `)
    }
    buildObjectEncoder(schema: ObjectSchema, isChild=false): (data: object) => string {
        return objectEncoder(schema, this.validator.builder, this, isChild)
    }


    buildEncoder(schema:GenericSchema, isChild=false){
        switch(schema.type){
            case "string":
                return this.buildStringEncoder(schema as StringSchema, isChild);
            case "number":
                
                return this.buildNumberEncoder(schema as NumberSchema, isChild);
            case "boolean":
                return this.buildBooleanEncoder(schema as BooleanSchema, isChild);
            case "object":
                return this.buildObjectEncoder(schema as ObjectSchema, isChild)
            default:
                throw new Error(`No encoder support for type ${schema.type}}`)
        }
    }

}