import { BooleanSchema } from './../../Schemas/_BooleanSchema';
import { GenericSchema } from './../../Schemas/Schema';
import { AnySchema, ArraySchema, NumberSchema, ObjectSchema, StringSchema, Validator } from "../../.."
import getValidator from "../Validator/getValidator"
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

`
export interface BuildEncoderOptions{
    asFunction?:boolean;
    child?:boolean;
}
export default class EncoderBuilder{
    private validator:Validator;
    constructor(validator:Validator){
        this.validator = validator
    }
    buildStringEncoder(schema: StringSchema) {
        return `
        let data = ${schema.id}
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
        `
    }
    buildNumberEncoder(schema: NumberSchema) {
        return  `
            const num = Number(${schema.id})
            return ''+num
        `
    }
    buildBooleanEncoder(schema:BooleanSchema) {
        return `
            return ${schema.id} ? "true" : "false"
        `
    }
    buildObjectEncoder(schema: ObjectSchema) {
        const propertyEncoders = () => {
            let code = ""
            let first = true
            for(let [name, sch] of schema.properties){        
                const encode = `
                encoded+=\`${first?"":","}"${name}":\${encode_${sch.id}(${schema.id}["${name}"])}\`
                `
                if(schema.required.includes(name)){
                    code+=`
                    ${encode}
                    `
                }
                else{
                    code+=`
                    if(${schema.id}["${name}"]){
                        ${encode}
                    }
                    `
                }
                first=false
    
            }
            
            return code
        }
        function isProperty(v:string){
            let code = ""
            let first=true;
            for(let [key, _] of schema.properties){
                if(!first){
                    code+="||"
                }
                code+=` ${v}==="${key}"`
                first=false
            }        
            return code
        }
        function unknownPropertyEncoders(){
            let code = `
            Object.keys(${schema.id}).forEach(key=> {
                if(!(${isProperty("key")})){
                    if(encoded.endsWith(",")){
                        encoded+=JSON.stringify(${schema.id}[key])
                    }
                    else{
                        encoded+=","+'"'+key+'"'+":"+JSON.stringify(${schema.id}[key])
                    }
                }
            })
            `
            return code
        }
        // If the schema is strict, construct a highly optimized encoder function
        return  `
            let encoded="{";
            ${propertyEncoders()}
            ${!schema.strict?unknownPropertyEncoders():""}
            encoded+="}";
            return encoded;
        `
    }
    buildArrayEncoder(schema:ArraySchema){
        const childEncoders = () => {
            let code = ""
            for(let sch of schema.items){
                code+=`
                if(!enc && ${sch.typecheck.replaceAll(sch.id, "item")}){
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
        const fn = `
            let encoded = "[";
            let first=true;
            ${schema.id}.forEach((item, index) => {
                let enc=false
                ${childEncoders()}
                throw new Error(\`Could not encode index \${index} for an unknown reason\`)
            })
            return encoded + "]"
        `   
        return fn
    }
    buildAnyEncoder(schema:AnySchema){
        return `
            return JSON.stringify(${schema.id})
        `
    }

    build(schema:GenericSchema, opts:BuildEncoderOptions={}){
        const child = opts.child||false
        let encoder:string = `
        ${child?"":`if(!validate_${schema.id}(${schema.id}))return null;`}
        `;        
        switch(schema.type){
            case "string":
                encoder += this.buildStringEncoder(schema as StringSchema);
                break;
            case "number":
                encoder += this.buildNumberEncoder(schema as NumberSchema);
                break;
            case "boolean":
                encoder += this.buildBooleanEncoder(schema as BooleanSchema);
                break;
            case "object":
                encoder+= this.buildObjectEncoder(schema as ObjectSchema)
                break;
            case "array":
                encoder+= this.buildArrayEncoder(schema as ArraySchema)
            case "any":
                encoder = this.buildAnyEncoder(schema as AnySchema);
                break;
            default:
                throw new Error(`No encoder support for type ${schema.type}`)
        }
        
        if(!child){
            const validator = getValidator(schema, this.validator.builder)
            let dependencies = codeGenDeps
            // Add the Validator as a dependency
            dependencies+=`
            function validate_${schema.id}(${schema.id}){
                ${validator}
            }
            `   
            // Build child encoders as dependencies for container data types
            if(schema instanceof ObjectSchema || schema instanceof ArraySchema){
                for(let path in schema.allChildren){
                    const value = schema.allChildren[path]
                    const source = this.build(value, {asFunction:false, child: true})
                    
                    let func = `
                    function encode_${value.id}(${value.id}){
                        ${source}
                    }
                    `
                    
                    
                    dependencies+=func
                    
                }
            }
            encoder=dependencies+"\n\n"+encoder
            
        }

        
        const asFunction = opts.asFunction===false?false:true
        if(!asFunction){
            return encoder
        }
        else{
            
            return new Function(schema.id, encoder)
        }
    }

}