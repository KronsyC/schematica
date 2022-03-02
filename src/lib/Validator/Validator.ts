import { GenericSchema } from '../..';
import ValidatorBuilder from './ValidatorBuilder';


export interface ValidatorOptions{
}

const kBuilder = Symbol("Validator Builder");
export default class Validator {
    builder: ValidatorBuilder;
    constructor() {
        this.builder = new ValidatorBuilder();
    }


    build(schema: GenericSchema, options:ValidatorOptions={}) {
        // This function should only be invoked by the user, for any internal purposes use the builder directly and cache under a different key

        
        const validator = this.builder.build(schema)
        if(typeof validator==="function")return validator as (data:any)=>boolean
        throw new Error("If you get this error, something is seriously broken")
    }
    static default = new Validator()
}
