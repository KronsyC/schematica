import { GenericSchema, BooleanSchema, NumberSchema, StringSchema, AnySchema, ObjectSchema } from './../../Schemas';
function prettyPrint(fn:Function) {
    let formattedSource = fn.toString()
  
    // Add line breaks after curly braces and semicolons
    formattedSource = formattedSource.replace(/([{};])/g, "$1\n");
  
    // Add space after opening curly brace
    formattedSource = formattedSource.replace(/(\S)\{/g, "$1 {");
  
    // Indent lines ending with a semicolon
    formattedSource = formattedSource.replace(/^(.*?);/gm, "    $1;");
  
    return formattedSource;
  }

// All Functions should be embeddable
export default class ValidatorBuilder{
    buildStringValidator(schema:StringSchema, varname:string){
        const fn = new Function(varname, `
        if(typeof ${varname} === "string"){
            ${schema.maxLength<Number.MAX_SAFE_INTEGER ?`if(${varname}.length > ${schema.maxLength}){return false;}`:""}
            ${schema.minLength>0 ? `if(${varname}.length < ${schema.minLength}){return false;}`:""}
            ${schema.match?`if (${schema.match}.test(data)){return true;}else{return false;}`:""}
            return true
        }
        else{
            return false
        }
    `)        
    
    return fn;
    }
    buildNumberValidator(schema:NumberSchema, varname:string){
        const fn = new Function(varname, `
        if(typeof ${varname} === "number"){
            ${schema.max<Number.MAX_SAFE_INTEGER? `if(${varname}>${schema.max}){return false;}`:""}
            ${schema.min>Number.MIN_SAFE_INTEGER? `if(${varname}<${schema.min}){return false;}`:""}
            return true
        }
        else{
            return false
        }
        `)
        
        return fn;
    }
    buildBooleanValidator(schema:BooleanSchema, varname:string){
        // Boolean validators are extremely dumb for the time being
        const fn = new Function(varname, `
        if(typeof ${varname} === "boolean"){
            return true
        }
        else{
            return false
        }
        `)
        return fn
    }
    buildAnyValidator(schema:AnySchema, varname:string){
        const fn = new Function(varname, `
        if(${varname}){
            return true
        }
        else{
            return false
        }
        `)
        return fn
    }

    buildObjectValidator(schema:ObjectSchema, varname:string){
        const buildChildValidators = () => {
            let code = ""
            schema.properties.forEach((value, key) => {
                const childValidator = this.buildValidator(value, key)

                // Clean up the function to only include source code
                let sourceCode = childValidator.toString().replace(`function anonymous(${key}\n) {\n\n`, "").slice(0, -1)
                // Replace return true so it doesnt't cause early termination
                sourceCode = sourceCode.replace("return true", "")
                code += `\nconst ${key} = ${varname}.${key};`
                // If it is marked as required
                if(schema.required.includes(key)){
                    code+=sourceCode
                    code+=`delete ${varname}.${key};`
                }
                else{
                    code+=`
                    if(${key}){
                        ${sourceCode}
                        delete ${varname}.${key};

                    }
                    `
                }
            })
            return code
        }
        const additionalPropertiesCheck = () => {
            
            let code = ""
            if(schema.additionalProperties){

            }
            else{
                code+=`
                if(Object.keys(${varname}).length > 0){
                    return false
                }
                `
            }
            
            return code
        }
        let fnSource = `
        if(typeof ${varname} === "object"){
            ${buildChildValidators()}
            ${additionalPropertiesCheck()}
            return true
        }
        else{
            return false
        }
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
    buildValidator(schema:GenericSchema, varname:string="data"): Function{
        switch(schema.type){
            case "string":
                return this.buildStringValidator(schema as StringSchema, varname)
            case "number":
                return this.buildNumberValidator(schema as NumberSchema, varname)
            case "boolean":
                return this.buildBooleanValidator(schema as BooleanSchema, varname)
            case "any":
                return this.buildAnyValidator(schema as AnySchema, varname)
            case "object":
                return this.buildObjectValidator(schema as ObjectSchema, varname)
            default:
                throw new Error(`Cannot build validator for type ${schema.type}}`)
        }
    }
}