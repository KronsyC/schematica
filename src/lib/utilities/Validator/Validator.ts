import { GenericSchema } from '../../..';
import ValidatorBuilder from './ValidatorBuilder';


export interface ValidatorOptions{
    errors?: boolean
}

const kBuilder = Symbol("Validator Builder");
export default class Validator {
    builder: ValidatorBuilder;
    constructor() {
        this.builder = new ValidatorBuilder();
    }


    build(schema: GenericSchema, options:ValidatorOptions={}) {
        // This function should only be invoked by the user, for any internal purposes use the builder directly and cache under a different key


        const error = options.errors || false;

        
        const validator = this.builder.build(schema)
        
        if(error){
            return validator
        }
        else{
            // Create a wrapper around the function that returns false instead of an error
            return function(data:unknown){
                try{
                    return validator(data)
                }
                catch{
                    return false;
                }
            }
        }
    }
    static default = new Validator()
}
