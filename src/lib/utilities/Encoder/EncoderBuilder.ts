import { BooleanSchema } from './../../Schemas/_BooleanSchema';
import { GenericSchema } from './../../Schemas/Schema';
import { AnySchema, ArraySchema, NumberSchema, ObjectSchema, StringSchema, Validator } from "../../.."
import getValidator from "../helpers/getValidator"
import objectEncoder from "./objectEncoder";
import extractSourceFromFn from '../helpers/extractSourceFromFn';

export const codeGenDeps = `
function $escaped(char){
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
function $encodeStr(_data){
    try{
        let data = _data
        let i=data.length-1;
        while(i>-1){
            const char = data[i]   
            if(char==='"'|| char==="\\b" || char==="\\\\" || char==="\\f" || char==="\\n" || char==="\\r" ){                        
                data = data.slice(0, i) + $escaped(char) + data.slice(i+1)
                i--   
            }
            i--
        }
        return '"' + data + '"'
    }
    catch(err){
        throw err
    }
}
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
        if(isChild){
            // Make a call to $encodeStr, because optimization babyyyy
            // This works because validation is handled by the parent
            //@ts-expect-error
            return new Function(schema.id, `return $encodeStr(${schema.id})`)
        }
        //@ts-expect-error
        return new Function(schema.id, `
        ${!isChild ? codeGenDeps : ""}
        try{
            let data = ${schema.id}
            ${!isChild ? extractSourceFromFn(validator).replace("return true", ""):""}
            let i=data.length-1;
            while(i>-1){
                const char = data[i]   
                if(char==='"'|| char==="\\b" || char==="\\\\" || char==="\\f" || char==="\\n" || char==="\\r" ){                        
                    data = data.slice(0, i) + $escaped(char) + data.slice(i+1)
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
            ${!isChild?extractSourceFromFn(validator).replaceAll("return true", ""):""}
            return ${schema.id} ? "true" : "false"
        `)
    }
    buildObjectEncoder(schema: ObjectSchema, isChild=false): (data: object) => string {
        return objectEncoder(schema, this.validator.builder, this, isChild)
    }
    buildArrayEncoder(schema:ArraySchema, isChild=false):(data:any[]) => string{
        const validator = getValidator(schema, this.validator.builder)           
        const validatorSrc = extractSourceFromFn(validator)
        const childEncoderDeclarations = () => {
            let code = ""
            for(let sch of schema.items){
                const encoder = this.buildEncoder(sch, true)
                const encoderSrc = extractSourceFromFn(encoder)
                
                code+=`
                function ${sch.id}_encoder(${sch.id}){
                    ${encoderSrc.replaceAll("//#return", "")}
                }
                `
            }
            return code
        }
        const childEncoders = () => {
            let code = ""
            for(let sch of schema.items){
                code+=`
                if(!enc&&${sch.typecheck.replaceAll(sch.id, "item")}){
                    const ${sch.id}_encoded = ${sch.id}_encoder(item);
                    enc=true;
                    encoded+= !first?","+${sch.id}_encoded : ${sch.id}_encoded
                    first=false
                    return
                }
                `
            }
            return code
        }
        const fn = new Function(schema.id, `
            ${codeGenDeps}
            ${!isChild?validatorSrc.slice(0, validatorSrc.indexOf("//#return") || -1):""}
            ${childEncoderDeclarations()}
            let encoded = "[";
            let first=true;
            ${schema.id}.forEach((item, index) => {
                let enc=false
                ${childEncoders()}
                throw new Error(\`Could not encode index \${index} for an unknown reason\`)
            })
            return encoded + "]"
        `)       
        //@ts-expect-error 
        return fn
    }
    buildAnyEnocder(schema:AnySchema, isChild = false):(data:any) => string{
        const validator= getValidator(schema, this.validator.builder);
        //@ts-expect-error
        return new Function(schema.id, `
            ${!isChild?extractSourceFromFn(validator).replaceAll("return true", ""):""}
            return JSON.stringify(${schema.id})
        `)
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
                return this.buildObjectEncoder(schema as ObjectSchema, isChild);
            case "array":
                return this.buildArrayEncoder(schema as ArraySchema, isChild)
            case "any":
                return this.buildAnyEnocder(schema as AnySchema, isChild);
            default:
                throw new Error(`No encoder support for type ${schema.type}}`)
        }
    }

}