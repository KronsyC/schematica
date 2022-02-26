import extractSourceFromFn from '../helpers/extractSourceFromFn';
import { GenericSchema, BooleanSchema, NumberSchema, StringSchema, AnySchema, ObjectSchema, ArraySchema, SchemaType } from './../../Schemas';
interface BuildValidatorOptions{
    isChild?:boolean;
    context?:string;
    errors?:boolean;
    asFunction?:boolean;
}
export const deps =`
function $stringCheck(data){
    return typeof data === "string"
}
function $numberCheck(data){
    return typeof data === "number" && isFinite(data) && !isNaN(data)
}
function $booleanCheck(data){
    return typeof data === "boolean"
}
function $arrayCheck(data){
    return Array.isArray(data)
}
function $objectCheck(data){
    return typeof data === "object" && !Array.isArray(data)
}
function $anyCheck(data){
    return !!data
}
`
export default class ValidatorBuilder{
    buildStringValidator(schema:StringSchema){     
        const varname = schema.id
        const fn =  `
        if(!$stringCheck(${varname})){
            //#error
            throw new Error(\`{{name}} must be of type "string", but was found to be of type \${typeof ${varname}}\`);
            //#enderror
        }
        ${schema.maxLength<Number.MAX_SAFE_INTEGER ?`if(${varname}.length > ${schema.maxLength}){
            //#error
            throw new Error(\`{{name}}  may not contain over ${schema.maxLength} character(s), but was found to have \${${varname}.length}\`);
            //#enderror
        }`:""
        }
        ${schema.minLength>0 ? `if(${schema.id}.length < ${schema.minLength}){
            //#error
            throw new Error(\`{{name}}  must contain at least ${schema.minLength} character(s), but was found to have \${${varname}.length}\`);
            //#enderror
        }`:""}
        //#return
        return true;
        //#endreturn
    `    
    return fn
    }
    buildNumberValidator(schema:NumberSchema){
        const fn = `
        if(!$numberCheck(${schema.id})){
            //#error
            throw new Error(\`{{name}} must be of type "number", but was found to be of type \${typeof ${schema.id}}\`);
            //#enderror
        }
        ${schema.max<Number.MAX_SAFE_INTEGER? `if(${schema.id}>${schema.max}){
            //#error
            throw new Error(\`{{name}} may be a max of ${schema.max}, but was found to be \${${schema.id}}\`);
            //#enderror
        }`:""}
        ${schema.min>Number.MIN_SAFE_INTEGER? `if(${schema.id}<${schema.min}){
            //#error
            throw new Error(\`{{name}} may be a minimum of ${schema.min}, but was found to be \${${schema.id}}\`);
            //#enderror
        }`:""}
        //#return
        return true
        //#endreturn
        `
        return fn;
    }
    buildBooleanValidator(schema:BooleanSchema){
        const fn = `
        if(!$booleanCheck(${schema.id})){
            //#error
            throw new Error(\`{{name}} must be of type "boolean", but was found to be of type \${typeof ${schema.id}}\`);
            //#enderror
        }
        //#return
        return true
        //#endreturn
        `
        return fn
    }
    buildAnyValidator(schema:AnySchema){
        const fn =  `
        if(!$anyCheck(${schema.id})){
            //#error
            throw new Error(\`{{name}} must be truthy, but a falsy value was provided\`);
            //#enderror
        }
        //#return
        return true
        //#endreturn
        `
        return fn
    }
    buildObjectValidator(schema:ObjectSchema){      
        const genKeyCheck = (name:string) => {
            let code = ""
            for(let [key] of schema.properties){
                code+=`${name} === "${key}"||`
            }
            code = code.slice(0, -2)
            
            return code
        }
        const strictCheck = () => {
            let code = ""
            if(schema.strict){
                code+=`
                for(let key in ${schema.id}){
                    if(!(${genKeyCheck("key")})){
                        //#error
                        throw new Error(\`Key \${key} is not allowed\`);
                        //#enderror
                    }
                }
                `
            }
            
            return code
        }
        const childValidators = () => {
            let code = "";
            schema.properties.forEach( (child, key) => {
                const isRequired = schema.required.includes(key)
                if(isRequired){
                    code+=`if(!validate_${child.id}(${schema.id}["${key}"]))return false;`
                }
                else{
                    code+=`
                    if(${schema.id}["${key}"]){
                        if(!validate_${child.id}(${schema.id}["${key}"]))return false;
                        
                    }
                    `
                }
            } )
            return code
        }
        let fn = `
        if(!$objectCheck(${schema.id})){
            //#error
            throw new Error(\`{{name}} must be of type "object", but was found to be of type \${typeof ${schema.id}}\`);
            //#enderror
        }
        ${schema.strict ? strictCheck():undefined}
        ${childValidators()}
        //#return
        return true
        //#endreturn
        `
        
        return fn
    }
    buildArrayValidator(schema:ArraySchema){

        const childValidators = () => {
            let code = ""
            for(let sch of schema.items){
                code+=`
                if(validate_${sch.id}(${schema.id}[index])){
                    continue;
                }
                `
            }
            return code
        }
        const fn =  `

            if(!$arrayCheck(${schema.id})){
                throw new Error(\`Data must be of type "array", but was found to be of type \${typeof ${schema.id}}\`);
            }
            ${schema.maxSize<Number.MAX_SAFE_INTEGER ?`if(${schema.id}.length > ${schema.maxSize}){
                throw new Error(\`Data may not contain over ${schema.maxSize} item(s), but was found to have \${${schema.id}.length}\`);
    
            }`:""
            }
            ${schema.minSize>0 ? `if(${schema.id}.length < ${schema.minSize}){
                throw new Error(\`Data must contain at least ${schema.minSize} item(s), but was found to have \${${schema.id}.length}\`);
            }`:""}
            for(let index = 0;index<${schema.id}.length;index++){
                ${childValidators()}
                throw new Error(\`Data does not match schema at index \${index}\`)
            }
            
            return true


        `
        
        return fn

    }

    build(schema:GenericSchema, options: BuildValidatorOptions={}): Function|string{
        
        let validatorSrc:string
        
        switch(schema.type){
            case "string":
                validatorSrc = this.buildStringValidator(schema as StringSchema);
                break;
            case "number":
                validatorSrc = this.buildNumberValidator(schema as NumberSchema)
                break;

            case "boolean":
                validatorSrc = this.buildBooleanValidator(schema as BooleanSchema)
                break;
            case "any":
                validatorSrc = this.buildAnyValidator(schema as AnySchema)
                break;

            case "object":
                validatorSrc = this.buildObjectValidator(schema as ObjectSchema)
                break;
            case "array":
                validatorSrc = this.buildArrayValidator(schema as ArraySchema)
                break;
            default:
                throw new Error(`Cannot build validator for type ${schema.type}`)
        }
        
        const child = options.isChild || false
        const context = options.context
        const name = context || schema.name
    
        // If Errors are disabled, replace all flagged error statements with 'return false'

        validatorSrc=validatorSrc.replaceAll("{{name}}", name)

        if(!child){
            // Smaller Dependencies
            let dependencies = ""
            let types:SchemaType[] = []
            if(schema instanceof ArraySchema || schema instanceof ObjectSchema){
                types.push(...schema.allTypes)
            }
            types.includes(schema.type)?undefined:types.push(schema.type)
            dependencies += deps
            
            // If the schema is a container type, generate all of it's child validators as dependencies
            if(schema instanceof ObjectSchema || schema instanceof ArraySchema){
                const children:{[x:string]:GenericSchema} = schema.allChildren
                
                for(let path in children){
                    const child = children[path]                    
                                        
                    const validator = this.build(child, {
                        isChild: true,
                        context: schema.name + "." + path,
                        errors: true, // Allow errors to propogate to the top level
                        asFunction: false // Source code
                    })
                    
                    dependencies+=`
                    function validate_${child.id}(${child.id}){
                        ${validator}
                    }
                    `
                }
                
            }
            
            validatorSrc = dependencies+"\n\n"+validatorSrc
            
        }
        if(!options.errors){
            while(validatorSrc.includes("//#error")){

                const start = validatorSrc.indexOf("//#error")
                const end = validatorSrc.indexOf("//#enderror")
                
                validatorSrc = validatorSrc.slice(0, start) + "return false;\n"+ validatorSrc.slice(end+11)
            }
        }
        const asFunction = options.asFunction===undefined?true:options.asFunction
        
        const validator = asFunction?new Function(schema.id, validatorSrc):validatorSrc
        schema.cache.set(`validator${options.errors?"-withError":""}${options.asFunction===false?"-asText":""}`, validator)
        return validator
    }
}