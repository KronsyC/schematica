import { GenericSchema, Validator } from "../../..";
import ValidatorBuilder from "./ValidatorBuilder";

export default function getValidator(schema:GenericSchema, validator:ValidatorBuilder):string{
    let vld = schema.cache.get("validator-withError-asText")
    
    if(vld){
        
        return vld
    }
    else{
        //@ts-expect-error
        return validator.build(schema, {
            asFunction: false,
            errors: true
        })
    }
}