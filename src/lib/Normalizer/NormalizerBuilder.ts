
import { GenericSchema, StringSchema, NumberSchema, BooleanSchema, AnySchema, ArraySchema, ObjectSchema } from "../../Schemas";
import getValidator from "../Validator/getValidator";
import Validator from "../Validator/Validator";
export interface BuildNormalizerOptions{
    isChild?:boolean;
    asFunction?:boolean
}
export default class NormalizerBuilder{
    private validator:Validator;
    constructor(validator:Validator){
        this.validator = validator
    }

    buildStringNormalizer(schema:StringSchema){
        return `
            const ${schema.id}_conv = String(${schema.id})
        `
    }
    buildNumberNormalizer(schema:NumberSchema){
        return `
        const ${schema.id}_conv = Number(${schema.id})
        `
    }
    buildBooleanNormalizer(schema:BooleanSchema){
        return  `
        const ${schema.id}_conv = Boolean(${schema.id})
        `
    }
    buildAnyNormalizer(schema:AnySchema){
        return `
        const ${schema.id}_conv = ${schema.id}
        `
    }
    buildObjectNormalizer(schema:ObjectSchema){
        const buildChildNormalizers = () => {
            let code = ""
            schema.properties.forEach((value, key) => {
                code+=`
                if(${schema.id}["${key}"]){
                    ${schema.id}_conv["${key}"] = normalize_${value.id}(${schema.id}["${key}"])
                }
                `
                
            })
            return code
        }
        const constDeclaration = () => {
            let code = `const ${schema.id}_conv = ${schema.structure}`
            if(!schema.strict){
                // Set the converted props to the initial props
                // They will be gradually replaced with the normalized equivalents
                code = `
                const ${schema.id}_conv = { ...${schema.structure}, ...${schema.id} }
                `
            }
            return code
        }
        return`
        ${constDeclaration()}
        

        if(Array.isArray(${schema.id})){
            throw new Error("Cannot use arrays with an object normalizer")
        }
        ${buildChildNormalizers()}
        `
    }
    buildArrayNormalizer(schema: ArraySchema){
        if(schema.items.size !==1){
            throw new Error("The Array Normalizer can only be used with schemas of one item type")
        }
        const item_id = Array.from(schema.items.keys())[0].id


        return `
            const ${schema.id}_conv = []
            if(!Array.isArray(${schema.id})){
                throw new Error("Data passed to an array normalizer must be an array")
            }
            ${schema.id}.forEach(item => {
                ${schema.id}_conv.push(normalize_${item_id}(item))
            })
        `
    }
    build(schema:GenericSchema, options: BuildNormalizerOptions={}){
        const child = options.isChild ?? false
        const asFunction = options.asFunction??true

        let normalizer = ""
        switch(schema.type){
            case "string":
                normalizer+= this.buildStringNormalizer(schema as StringSchema);
                break;

            case "number":
                normalizer+= this.buildNumberNormalizer(schema as NumberSchema);
                break;

            case "boolean":
                normalizer+= this.buildBooleanNormalizer(schema as BooleanSchema);
                break;

            case "any":
                normalizer+= this.buildAnyNormalizer(schema as AnySchema);
                break;

            case "object":
                normalizer+= this.buildObjectNormalizer(schema as ObjectSchema)
                break;

            case "array":
                normalizer+= this.buildArrayNormalizer(schema as ArraySchema)
                break;
            default:
                throw new Error(`Cannot create normalizer for type ${schema.type}`)
        }
        if(!child){
            
            const validator = getValidator(schema, this.validator.builder)            
            
            let dependencies = `
            function validate_${schema.id}(${schema.id}){
                ${validator}
            }
            if(!validate_${schema.id}(${schema.id}_conv)){
                throw Object.defineProperty(new Error("Data does not match normalizer schema"), "error", {value: validate_${schema.id}.error})
            }
            `
            if(schema instanceof ObjectSchema || schema instanceof ArraySchema){
                const children = schema.allChildren
                for(let path in children){
                    const child = children[path]
                    const normalizer = this.build(child, {asFunction: false, isChild: true})
                    dependencies+=`
                    function normalize_${child.id}(${child.id}){
                        ${normalizer}
                    }
                    `
                }
            }

            
            normalizer+=dependencies
        }
        normalizer+=`
        return ${schema.id}_conv
        `

        if(asFunction){
                        
            return new Function(schema.id, normalizer)
        }
        else{
            return normalizer
        }
    }
}