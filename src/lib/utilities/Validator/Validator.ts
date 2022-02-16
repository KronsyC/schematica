import { GenericSchema } from '../../..';
import ValidatorBuilder from './ValidatorBuilder';


export interface ValidatorOptions{
    errors?: boolean
}

const kBuilder = Symbol("Validator Builder");
export default class Validator {
    [kBuilder]: ValidatorBuilder;
    constructor() {
        this[kBuilder] = new ValidatorBuilder();
    }

    build(schema: GenericSchema, options:ValidatorOptions={}) {
        const error = options.errors || false;
        const validator = this[kBuilder].buildValidator(schema)
        console.log(validator.toString());
        
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
