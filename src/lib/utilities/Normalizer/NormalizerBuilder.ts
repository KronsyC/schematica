
import { GenericSchema, StringSchema, NumberSchema, BooleanSchema, AnySchema, ArraySchema, ObjectSchema } from "../../Schemas";
import extractSourceFromFn from "../helpers/extractSourceFromFn";
import getValidator from "../Validator/getValidator";
import Validator from "../Validator/Validator";

export default class NormalizerBuilder{
    private validator:Validator;

    constructor(validator:Validator){
        this.validator = validator
    }

    // All of the primitive type normalizers are essentially identical

    buildStringNormalizer(schema:StringSchema, isChild:boolean):(data:any)=>string{
        const validatorSource = getValidator(schema, this.validator.builder)
        
        const fn = new Function(schema.id, `
            ${isChild?"":`        
            function ${schema.id}_validator(${schema.id}){
                ${validatorSource.replaceAll("//#return", "") /* Remove the #return flag*/}
            }
            `}
            const ${schema.id}_conv = String(${schema.id})
            ${isChild?"":`${schema.id}_validator(${schema.id}_conv)`}

            return ${schema.id}_conv
        `)
        //@ts-expect-error
        return fn
    }
    buildNumberNormalizer(schema:NumberSchema, isChild:boolean):(data:any)=>number{
        const validatorSource = getValidator(schema, this.validator.builder)
        const fn = new Function(schema.id, `
        ${isChild?"":`        
        function ${schema.id}_validator(${schema.id}){
            ${validatorSource.replaceAll("//#return", "") /* Remove the #return flag*/}
        }
        `}
        const ${schema.id}_conv = Number(${schema.id})
        ${isChild?"":`${schema.id}_validator(${schema.id}_conv)`}

        return ${schema.id}_conv
        `)
        //@ts-expect-error
        return fn
    }
    buildBooleanNormalizer(schema:BooleanSchema,isChild:boolean):(data:any)=>boolean{
        const validatorSource = getValidator(schema, this.validator.builder)
        const fn = new Function(schema.id, `
        ${isChild?"":`        
        function ${schema.id}_validator(${schema.id}){
            ${validatorSource.replaceAll("//#return", "") /* Remove the #return flag*/}
        }
        `}
        const ${schema.id}_conv = Boolean(${schema.id})
        ${isChild?"":`${schema.id}_validator(${schema.id}_conv)`}

        return ${schema.id}_conv
        `)
        //@ts-expect-error
        return fn
    }
    buildAnyNormalizer(schema:AnySchema,isChild:boolean):(data:any)=>any{
        const validatorSource = getValidator(schema, this.validator.builder)
        const fn = new Function(schema.id, `
        ${isChild?"":`        
        function ${schema.id}_validator(${schema.id}){
            ${validatorSource.replaceAll("//#return", "") /* Remove the #return flag*/}
        }
        `}
        ${isChild?"":`${schema.id}_validator(${schema.id})`}
        return ${schema.id}
        `)
        //@ts-expect-error
        return fn
    }
    buildObjectNormalizer(schema:ObjectSchema, isChild:boolean):(data:object)=>object{
        const validatorSource = getValidator(schema, this.validator.builder)
    
        const buildChildNormalizerDeclarations = () => {
            let code = ""
            schema.properties.forEach((value, key ) => {
                code+=`
                function ${value.id}_normalizer(${value.id}){
                    ${extractSourceFromFn(this.build(value, true))}
                }
                `
            })
            return code
        }
        const buildChildNormalizers = () => {
            let code = ""
            schema.properties.forEach((value, key) => {
                code+=`
                if(${schema.id}["${key}"]){
                    ${schema.id}_normalized["${key}"] = ${value.id}_normalizer(${schema.id}["${key}"])
                }
                `
                
            })
            return code
        }
        const fn = new Function(schema.id, `
        const ${schema.id}_normalized = ${schema.structure}


        ${isChild?"":`        
        function ${schema.id}_validator(${schema.id}){
            ${validatorSource.replaceAll("//#return", "") /* Remove the #return flag*/}
        }
        `}
        ${buildChildNormalizerDeclarations()}




        if(!${schema.typecheck}){
            throw new Error("Cannot use arrays with an object normalizer")
        }

        ${buildChildNormalizers()}


        ${isChild?"":`
            ${schema.id}_validator(${schema.id}_normalized)
        `}
        return ${schema.id}_normalized
        `)
        //@ts-expect-error
        return fn
    }
    build(schema:GenericSchema, isChild:boolean=false){
        
        switch(schema.type){
            case "string":
                return this.buildStringNormalizer(schema as StringSchema, isChild);
            case "number":
                return this.buildNumberNormalizer(schema as NumberSchema, isChild);
            case "boolean":
                return this.buildBooleanNormalizer(schema as BooleanSchema, isChild);
            case "any":
                return this.buildAnyNormalizer(schema as AnySchema, isChild);
            case "object":
                return this.buildObjectNormalizer(schema as ObjectSchema, isChild)
            default:
                throw new Error(`Cannot create normalizer for type ${schema.type}`)
        }
    }
}