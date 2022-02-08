import BaseSchema, {BaseSchemaTemplate} from './__BaseSchema';
import ERR_INVALID_RANGE from './errors/ERR_INVALID_RANGE';

export interface NumberSchemaTemplate extends BaseSchemaTemplate{
    type: "number";
    min?:number;
    max?:number;
}

export default class NumberSchema extends BaseSchema<NumberSchemaTemplate>{
    min:number;
    max:number;
    constructor(template:NumberSchemaTemplate){
        super(template)
        this.min=template.min||Number.MIN_SAFE_INTEGER
        this.max = template.max||Number.MAX_SAFE_INTEGER
        this.validateSchema()
    }

    override validateSchema(): void {
        if(this.max-this.min<0){
            throw new ERR_INVALID_RANGE("minLength cannot be larger than maxLength")
        }
    }
}