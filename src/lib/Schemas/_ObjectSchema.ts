import BaseSchema, {BaseSchemaTemplate} from './__BaseSchema';
import ERR_INVALID_RANGE from './errors/ERR_INVALID_RANGE';

export interface ObjectSchemaTemplate extends BaseSchemaTemplate{
    type: "object";
    additionalProperties?:boolean;
    required?:string[];
    properties: {  }
}

export default class NumberSchema extends BaseSchema<ObjectSchemaTemplate>{

    constructor(template:ObjectSchemaTemplate){
        super(template)

        this.validateSchema()
    }

    override validateSchema(): void {
        
    }
}