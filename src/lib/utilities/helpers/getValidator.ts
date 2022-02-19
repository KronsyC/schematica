import { GenericSchema, Validator } from "../../..";
import ValidatorBuilder from "../Validator/ValidatorBuilder";

export default function getValidator(schema:GenericSchema, validator:ValidatorBuilder):(data:unknown)=>boolean{
    let vld = schema.cache.get("validator")
    if(vld){
        return vld
    }
    else{
        //@ts-expect-error
        return validator.build(schema)
    }
}