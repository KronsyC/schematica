import { ERR_INVALID_DATA } from './errors/ERR_INVALID_DATA';
import { GenericSchema, StringSchema, NumberSchema } from '../../Schemas';
/**
 * The Parser Takes in a raw JSON string and returns an object
 * A Schema Can be used for data validation
 * Essentially just a wrapper around JSON.parse
 */

// Thank you secure-json-parse for the proto-pollution sanization logic and regex

import Validator from "../Validator/Validator";
import { ERR_BAD_JSON } from './errors/ERR_BAD_JSON';
import getValidator from '../Validator/getValidator';


const protoPollutionRegex = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/
const constructorPolutionRegex = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/

export interface ParserParams {
    validator?:Validator
}

export default class Parser{
    private validator : Validator
    constructor(params:ParserParams) {
        this.validator = params.validator || Validator.default
    }

    scrub(data:Object){
        let next = [data]
        while(next.length>0){
            const nodes = next
            next =[]
            nodes.forEach(node => {
                // Do not call hasOwnProperty Directly as it could possibly be poisoned
                if(Object.hasOwnProperty.call(node, "__proto__")){
                    //@ts-expect-error
                    delete node.__proto__
                }
                if(
                    Object.hasOwnProperty.call(node, "constructor") &&
                    Object.hasOwnProperty.call(node.constructor, "prototype")
                ){
                    //@ts-expect-error
                    delete node.constructor
                }
                if(node&&typeof node==="object"){
                    for(let [_, value] of Object.entries(node)){
                        if(value&&typeof value==="object"){
                            next.push(value)
                        }
                    }
                }

            })
        }
    }


    build(schema:GenericSchema){
        const parser = ((data:string, reviver?:( key:string, value:any )=>any) => {
            try{
                const parsed = JSON.parse(data)
                if(validator(parsed)){
                    // Do some safety checking

                    if(parsed===null||typeof parsed !== "object"){
                        // No protection needed
                        return parsed
                    }
                    else{
                        this.scrub(parsed)
                        if(protoPollutionRegex.test(data) || constructorPolutionRegex.test(data)){
                            // Scrub the data of all references to __proto__ and constructor                            
                            this.scrub(parsed)
                            
                        }
                        // No suspected poisoning     
                        return parsed

                    }
                }
                else{                    
                    throw new ERR_INVALID_DATA("Data does not match parser schema", validator.error)
                } 
            }
            catch(err){
                if( err instanceof SyntaxError){
                    throw new ERR_BAD_JSON(err.message)
                }
                else{
                    throw err
                }
            }
        })
        let validator = new Function(`return function validate_${schema.id}(${schema.id}){
            ${getValidator(schema, this.validator.builder)}
        } `)()
        
        return parser
    }
}