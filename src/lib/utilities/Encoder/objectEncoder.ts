import extractSourceFromFn from '../helpers/extractSourceFromFn';
import getValidator from '../helpers/getValidator';
import ValidatorBuilder from '../Validator/ValidatorBuilder';
import { ObjectSchema } from './../../Schemas';
import EncoderBuilder from './EncoderBuilder';
export default function objectEncoder(schema:ObjectSchema, validatorBuilder:ValidatorBuilder, encoderBuilder:EncoderBuilder) : (data:unknown)=>string{
    function propertyEncoders(){
        let code = ""
        let first = true
        for(let [name, sch] of schema.properties){
            const encoder = encoderBuilder.buildEncoder(sch)
            code+=`
            function ${sch.name}_encoder(${sch.name}){
                ${extractSourceFromFn(encoder)}
            }`
            if(schema.required.includes(name)){
                // Template literals are faster than concatenation for whatever reason
                code+=`
                encoded+=\`${!first?",":""}"${name}":\${${sch.name}_encoder(${schema.name}.${name})}\`;`
            }
            else{
                code+=`
                if(${schema.name}.${name}){
                    encoded+=\`${!first?",":""}"${name}":\${${sch.name}_encoder(${schema.name}.${name})}\`;
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
        for(let [key, value] of schema.properties){
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
        Object.keys(${schema.name}).forEach(key=> {
            if(!(${isProperty("key")})){
                if(encoded.endsWith(",")){
                    encoded+=JSON.stringify(${schema.name}[key])
                }
                else{
                    encoded+=","+'"'+key+'"'+":"+JSON.stringify(${schema.name}[key])
                }
            }
        })
        `
        return code
    }
    const validator = getValidator(schema, validatorBuilder);
    // If the schema is strict, construct a highly optimized encoder function
    const validatorSrc = extractSourceFromFn(validator)
    if(schema.strict){
        const fn = new Function(schema.name, `
            ${validatorSrc.replace("return true", "") }
            let encoded="{";
            ${propertyEncoders()}
            encoded+="}";
            return encoded;
        `)

        //@ts-expect-error        
        return fn
    }
    // Otherwise, do the same thing but use JSON.stringify for properties not defined within the schema
    else{
        const fn = new Function(schema.name, `
        ${validatorSrc.replace("return true", "") }
        let encoded="{";
        ${propertyEncoders()}
        ${unknownPropertyEncoders()}
        encoded+="}";
        return encoded;
    `)

    //@ts-expect-error        
    return fn
    }
    return (data:unknown)=>"NAN"
}

