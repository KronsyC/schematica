import { GenericSchema, BooleanSchema, NumberSchema, StringSchema, AnySchema, ObjectSchema, ArraySchema, SchemaType } from '../../Schemas';
interface BuildValidatorOptions{
    isChild?:boolean;
    context?:string;
    asFunction?:boolean;
}
const deps =`
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
        if(!($stringCheck(${varname})){
            $error({
                type: "ERR_TYPE_MISMATCH",
                reason: "must be of type 'string'"
            })
            return false
        }
        ${schema.maxLength<Number.MAX_SAFE_INTEGER ?`if(${varname}.length > ${schema.maxLength}){
            $error({
                type: "ERR_OUT_OF_RANGE",
                reason: "must not contain more than ${schema.maxLength} characters"
            })
            return false
        }`:""
        }
        ${schema.minLength>0 ? `if(${schema.id}.length < ${schema.minLength}){
            $error({
                type: "ERR_OUT_OF_RANGE",
                reason: "must contain at least ${schema.minLength} characters"
            })
            return false
        }`:""}
        return true;
    `    
    return fn
    }
    buildNumberValidator(schema:NumberSchema){
        const fn = `
        if(!$numberCheck(${schema.id})){
            if(isNaN(${schema.id})){
                $error({
                    type: "ERR_TYPE_MISMATCH",
                    reason: "cannot be NaN"
                })
                return false
            }
            $error({
                type: "ERR_TYPE_MISMATCH",
                reason: "must be of type 'number'"
            })
            return false
        }
        ${schema.max<Number.MAX_SAFE_INTEGER? `if(${schema.id}>${schema.max}){
            $error({
                type: "ERR_OUT_OF_RANGE",
                reason: "must not be over ${schema.max}"
            })
            return false
        }`:""}
        ${schema.min>Number.MIN_SAFE_INTEGER? `if(${schema.id}<${schema.min}){
            $error({
                type: "ERR_OUT_OF_RANGE",
                reason: "must be at least ${schema.min}"
            })
            return false
        }`:""}
        return true
        `
        return fn;
    }
    buildBooleanValidator(schema:BooleanSchema){
        const fn = `
        if(!$booleanCheck(${schema.id})){
            $error({
                type: "ERR_TYPE_MISMATCH",
                reason: "must be of type 'boolean'"
            })
            return false
        }
        return true
        `
        return fn
    }
    buildAnyValidator(schema:AnySchema){
        const fn =  `
        if(!$anyCheck(${schema.id})){
            $error({
                type: "ERR_NOT_NULLABLE",
                reason: "cannot be a null value"
            })
            return false
        }
        return true
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
                        $error({
                            type: "ERR_UNEXPECTED_PROPERTY",
                            reason: \`key \${key} is not allowed\`
                        })
                        return false
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
                    code+=`
                    if(${schema.id}["${key}"] === undefined){
                        $error({
                            type: "ERR_MISSING_PROPERTY",
                            reason: "missing required property '${key}'"
                        })
                        return false;
                    }
                    if(!validate_${child.id}(${schema.id}["${key}"]))return false;
                    `
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
            $error({
                type: "ERR_TYPE_MISMATCH",
                reason: "must be of type 'object'"
            })
            return false
        }
        ${childValidators()}
        ${schema.strict ? strictCheck():undefined}

        return true
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

                throw $additionalPropertyError(\`Data does not match schema at index \${index}\`)
            }
            
            return true


        `
        
        return fn

    }

    private buildDependencies(schema:GenericSchema){
        let dependencies = `
        function $error(params){
            const {type="Validation Error", reason} = params
        
            if(!(type&&reason)){
                throw (new Error("[INTERNAL] Must provide error type, context, and reason") .name = "ImplementationError")
            }
            validate_${schema.id}.error = {
                type,
                context: {{name}},
                reason
            }
        }
        `
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
                    asFunction: false // Source code
                })
                
                dependencies+=`
                function validate_${child.id}(${child.id}){
                    
                // Declare a localized error function bound to the current context
                function $error(params){
                    const {type="Validation Error", reason} = params

                    if(!(type&&reason)){
                        throw (new Error("[INTERNAL] Must provide error type, context, and reason") .name = "ImplementationError")
                    }
                    validate_${schema.id}.error = {
                        type,
                        context: "${schema.name +  "." + path}",
                        reason
                    }
                }
                    ${validator}
                }
                `
            }
            
        }
        return dependencies
    }
    build(schema:GenericSchema, options: BuildValidatorOptions={}): Function|string{
        
        // (fix) default the error to undefined
        let validatorSrc=`validate_${schema.id}.error = undefined`
        if(schema.nullable){
            // Add a null/undefined check to the data, if it is null or undefined return true
            validatorSrc+=`
            if(${schema.id}===undefined||${schema.id}===null||${schema.id}===""||${schema.id}===NaN){
                return true
            }
            `
        }
        switch(schema.type){
            case "string":
                validatorSrc += this.buildStringValidator(schema as StringSchema);
                break;
            case "number":
                validatorSrc += this.buildNumberValidator(schema as NumberSchema)
                break;

            case "boolean":
                validatorSrc += this.buildBooleanValidator(schema as BooleanSchema)
                break;
            case "any":
                validatorSrc += this.buildAnyValidator(schema as AnySchema)
                break;
            case "object":
                validatorSrc += this.buildObjectValidator(schema as ObjectSchema)
                break;
            case "array":
                validatorSrc += this.buildArrayValidator(schema as ArraySchema)
                break;
            default:
                throw new Error(`Cannot build validator for type ${schema.type}`)
        }
        
        const child = options.isChild ?? false
        const context = options.context
        
        const name = context || schema.name
    

        
        if(!child){
            const dependencies = this.buildDependencies(schema)
            validatorSrc = dependencies+"\n\n"+validatorSrc
            
        }
        validatorSrc=validatorSrc.replaceAll("{{name}}", `"${name}"`)
        // If Errors are disabled, replace all flagged error statements with 'return false'

        const asFunction = options.asFunction===undefined?true:options.asFunction
        let validator;
        if(asFunction){
                        
            validator = new Function(`
            let validate_${schema.id} = function(${schema.id}){
                ${validatorSrc}

            }
            validate_${schema.id} = validate_${schema.id}.bind(validate_${schema.id})
            return validate_${schema.id}
            `)
            validator = validator()          
              
            Object.defineProperty(validator, "error", {value: undefined, writable: true, configurable: true})
        }
        else{
            validator = validatorSrc
        }
        schema.cache.set(`validator${options.asFunction===false?"-asText":""}`, validator)
        return validator
    }
}