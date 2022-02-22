import extractSourceFromFn from '../helpers/extractSourceFromFn';
import getValidator from '../helpers/getValidator';
import { GenericSchema, BooleanSchema, NumberSchema, StringSchema, AnySchema, ObjectSchema, ArraySchema } from './../../Schemas';

// All Functions should be embeddable
export default class ValidatorBuilder{
    buildStringValidator(schema:StringSchema, varname:string){     
        const fnSrc =  `
        if(!${schema.typecheck}){
            throw new Error(\`Data must be of type "string", but was found to be of type \${typeof ${varname}}\`);
        }
        ${schema.maxLength<Number.MAX_SAFE_INTEGER ?`if(${varname}.length > ${schema.maxLength}){
            throw new Error(\`Data may not contain over ${schema.maxLength} character(s), but was found to have \${${varname}.length}\`);

        }`:""
        }
        ${schema.minLength>0 ? `if(${varname}.length < ${schema.minLength}){
            throw new Error(\`Data must contain at least ${schema.minLength} character(s), but was found to have \${${varname}.length}\`);
        }`:""}
        //#return
        return true;
    `    
    const fn = new Function(varname, fnSrc);
    return fn
    }
    buildNumberValidator(schema:NumberSchema, _varname:string){
        const varname = _varname
        const fn = new Function(varname, `
        if(!${schema.typecheck}){
            throw new Error(\`Data must be of type "number", but was found to be of type \${typeof ${varname}}\`);
        }
        ${schema.max<Number.MAX_SAFE_INTEGER? `if(${varname}>${schema.max}){
            throw new Error(\`Data may be a max of ${schema.max}, but was found to be \${${varname}}\`);
        }`:""}
        ${schema.min>Number.MIN_SAFE_INTEGER? `if(${varname}<${schema.min}){
            throw new Error(\`Data may be a minimum of ${schema.min}, but was found to be \${${varname}}\`);
        }`:""}
        //#return
        return true
        `)
        
        return fn;
    }
    buildBooleanValidator(schema:BooleanSchema){
        // Boolean validators are extremely dumb for the time being
        const fn = new Function(schema.id, `
        if(!${schema.typecheck}){
            throw new Error(\`Data must be of type "boolean", but was found to be of type \${typeof ${schema.id}}\`);
        }
        //#return
        return true
        `)
        return fn
    }
    buildAnyValidator(schema:AnySchema){
        const fn = new Function(schema.id, `
        if(!${schema.typecheck}){
            throw new Error(\`Data must be present, but a falsy value was provided\`);
        }
        //#return
        return true
        `)
        return fn
    }
    buildObjectValidator(schema:ObjectSchema){
        const buildChildValidators = () => {
            let code = ""
            schema.properties.forEach((value, key) => {
                const name = value.id
                const childValidator = getValidator(value, this)
                let sourceCode = extractSourceFromFn(childValidator);
                
                // Replace return true so it doesnt't cause early termination
                sourceCode = sourceCode.slice(0, sourceCode.indexOf("//#return"))
                // Make error messages more informative
                .replaceAll("Data", key)
                
                code += `\nconst ${name} = ${schema.id}["${key}"];`
                // If it is marked as required
                if(schema.required.includes(key)){
                    code+=sourceCode

                }
                else{
                    code+=`
                    if(${name}){
                        ${sourceCode}
                    }
                    `
                }
            })
            return code
        }
        
        const genKeyCheck = (name:string) => {
            let code = ""
            for(let [key, value] of schema.properties){
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
                        throw new Error(\`Key \${key} is not allowed\`);
                    }
                }
                `
            }
            else{ 
            }
            
            return code
        }
        let fnSource = `
        if(!${schema.typecheck}){
            throw new Error(\`Data must be of type "object", but was found to be of type \${typeof ${schema.id}}\`);
        }
        ${strictCheck()}
        ${buildChildValidators()}
        //#return
        return true

        `
        
        const fn = new Function(schema.id, fnSource)
        
        return fn
    }
    buildArrayValidator(schema:ArraySchema){

        const childValidatorDeclarations = () => {
            let code = ""
            for(let sch of schema.items){
                const validator = this.build(sch)
                const source = extractSourceFromFn(validator)
                // Returning false and ignoring the throw is 1000x faster than using try/catch
                // Use the string form of true so it isn't mistaken as the output of the whole validator and removed
                code+=`
                function ${sch.id}_validator(${sch.id}){
                    ${source.replaceAll("throw", "return false;throw").replaceAll("\n\n", "\n").replaceAll("//#return", "")}
                }
                `
            }
            
            return code
        }
        const childValidators = () => {
            let code = ""
            for(let sch of schema.items){
                code+=`
                if(${sch.id}_validator(${schema.id}[index])){
                    continue;
                }
                `
            }
            return code
        }
        const source =  `
            ${childValidatorDeclarations()}

            if(!(${schema.typecheck})){
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
            //#return
            return true


        `
        
        return new Function(schema.id, source)

    }
    build(schema:GenericSchema, varname:string=schema.id): Function{
        let validator:Function

        switch(schema.type){
            case "string":
                validator = this.buildStringValidator(schema as StringSchema, varname);
                break;
            case "number":
                validator = this.buildNumberValidator(schema as NumberSchema, varname)
                break;

            case "boolean":
                validator = this.buildBooleanValidator(schema as BooleanSchema)
                break;

            case "any":
                validator = this.buildAnyValidator(schema as AnySchema)
                break;

            case "object":
                validator = this.buildObjectValidator(schema as ObjectSchema)
                break;
            case "array":
                validator = this.buildArrayValidator(schema as ArraySchema)
                break;
            default:
                throw new Error(`Cannot build validator for type ${schema.type}`)
        }
        Object.defineProperty(validator, "name", {value: "validator"});
        //@ts-expect-error
        validator.schema = schema
        schema.cache.set("validator", validator)
        return validator;
    }
}