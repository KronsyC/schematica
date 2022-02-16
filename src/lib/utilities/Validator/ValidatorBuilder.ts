import extractSourceFromFn from '../helpers/extractSourceFromFn';
import { GenericSchema, BooleanSchema, NumberSchema, StringSchema, AnySchema, ObjectSchema } from './../../Schemas';

// All Functions should be embeddable
export default class ValidatorBuilder{
    getValidator(schema:GenericSchema){
        let vld = schema.cache.get("validator")
        if(vld){
            return vld
        }
        else{
            return this.buildValidator(schema)
        }
    }

    // finished
    buildStringValidator(schema:StringSchema, varname:string){     
        const fnSrc =  `
        if(typeof ${varname} !== "string"){
            throw new Error(\`Data must be of type "string", but was found to be of type \${typeof ${varname}}\`);
        }
        ${schema.maxLength<Number.MAX_SAFE_INTEGER ?`if(${varname}.length > ${schema.maxLength}){
            throw new Error(\`Data may not contain over ${schema.maxLength} characters, but was found to have \${${varname}.length}\`);

        }`:""
        }
        ${schema.minLength>0 ? `if(${varname}.length < ${schema.minLength}){
            throw new Error(\`Data must contain at least ${schema.minLength} characters, but was found to have \${${varname}.length}\`);
        }`:""}
        return true;
    `    
    const fn = new Function(varname, fnSrc);
    return fn
    }
    buildNumberValidator(schema:NumberSchema, _varname:string){
        const varname = _varname
        const fn = new Function(varname, `
        if(typeof ${varname} !== "number"){
            throw new Error(\`Data must be of type "number", but was found to be of type \${typeof ${varname}}\`);
        }
        ${schema.max<Number.MAX_SAFE_INTEGER? `if(${varname}>${schema.max}){
            throw new Error(\`Data may be a max of ${schema.max}, but was found to be \${${varname}}\`);
        }`:""}
        ${schema.min>Number.MIN_SAFE_INTEGER? `if(${varname}<${schema.min}){
            throw new Error(\`Data may be a minimum of ${schema.min}, but was found to be \${${varname}}\`);
        }`:""}
        return true
        `)
        
        return fn;
    }
    buildBooleanValidator(schema:BooleanSchema, varname:string){
        // Boolean validators are extremely dumb for the time being
        const fn = new Function(varname, `
        if(typeof ${varname} !== "boolean"){
            throw new Error(\`Data must be of type "boolean", but was found to be of type \${typeof ${varname}}\`);
        }
        return true
        `)
        return fn
    }
    buildAnyValidator(schema:AnySchema, varname:string){
        const fn = new Function(varname, `
        if(!${varname}){
            throw new Error(\`Data must be present, but a falsy value was provided\`);

        }
        return true
        `)
        return fn
    }
    buildObjectValidator(schema:ObjectSchema, varname:string){
        const buildChildValidators = () => {
            let code = ""
            schema.properties.forEach((value, key) => {
                const name = value.name
                const childValidator = this.getValidator(value)
                let sourceCode = extractSourceFromFn(childValidator);

                // Replace return true so it doesnt't cause early termination
                sourceCode = sourceCode.replace("return true", "")
                // Makes error messages work better
                .replace("Data", key)
                
                code += `\nconst ${name} = ${varname}.${key};`
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
                for(let key in ${varname}){
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
        if(!(${varname}&&typeof ${varname} === "object"&&!Array.isArray(${varname}))){
            throw new Error(\`Data must be of type "object", but was found to be of type \${typeof ${varname}}\`);


        }
        ${strictCheck()}
        ${buildChildValidators()}
        return true
        `
        //#region formatter This currently breaks with for(i=0;i<num;i++) style loops but i'm too lazy to fix it
        fnSource = fnSource.
        replaceAll("\n", "")
        .replaceAll("}", "\n}\n")
        .replaceAll("{", "{\n")
        .replaceAll(";", "\n")
        .replaceAll("  ", "")
        .replaceAll("\n\n", "\n")

        
        // Pass 2: Add indentation
        let _indentations=0
        let indentations = 0;
        let tmpSrc = "";
        let currentLine=""
        for(let i = 0; i<fnSource.length;i++){
            let char = fnSource.charAt(i)
            currentLine+=char
            if(char==="\n"){
                tmpSrc+="  ".repeat(indentations)+currentLine
                indentations=_indentations
                currentLine=""
            }
            else if(char === "{"){
                _indentations++
            }
            else if(char === "}"){
                _indentations--
                indentations--
            }
        }
        fnSource = tmpSrc
        //#endregion formatter
                
        const fn = new Function(varname, fnSource)
        
        return fn
    }
    buildValidator(schema:GenericSchema, varname:string=schema.name): Function{
        let validator:Function

        switch(schema.type){
            case "string":
                validator = this.buildStringValidator(schema as StringSchema, varname);
                break;
            case "number":
                validator = this.buildNumberValidator(schema as NumberSchema, varname)
                break;

            case "boolean":
                validator = this.buildBooleanValidator(schema as BooleanSchema, varname)
                break;

            case "any":
                validator = this.buildAnyValidator(schema as AnySchema, varname)
                break;

            case "object":
                validator = this.buildObjectValidator(schema as ObjectSchema, varname)
                break;
            default:
                throw new Error(`Cannot build validator for type ${schema.type}}`)
        }
        validator.prototype.name = "validator"
        schema.cache.set("validator", validator)
        return validator;
    }
}