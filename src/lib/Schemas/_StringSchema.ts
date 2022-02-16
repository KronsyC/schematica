import {BaseSchema, BaseSchemaTemplate} from '.';
import ERR_INVALID_RANGE from './errors/ERR_INVALID_RANGE';

export interface StringSchemaTemplate extends BaseSchemaTemplate{
    type: "string";
    minLength?:number;
    maxLength?:number;
    encoding?:TextEncoding;
}
export type TextEncoding = "ascii"|"utf8"|"unicode"

export class StringSchema extends BaseSchema<StringSchemaTemplate>{
    minLength:number;
    maxLength:number;
    encoding:TextEncoding;
    constructor(template:StringSchemaTemplate){
        super(template)
        this.encoding=template.encoding||"unicode" // Unicode is fastest to validate
        // this.match=template.match?`/${template.match.source}/`:undefined
        this.minLength = template.minLength||0
        // Nobody will ever realistically exceed this number
        this.maxLength = template.maxLength||Number.MAX_SAFE_INTEGER
        this.validateSchema()

    }

    override validateSchema(): void {
        if(this.minLength<0){
            throw new ERR_INVALID_RANGE("minLength must be greater or equal to 0")
        }
        else if(this.maxLength<0){
            throw new ERR_INVALID_RANGE("maxLength must be greater or equal to 0")
        }
        else if(this.maxLength-this.minLength<0){
            throw new ERR_INVALID_RANGE("minLength cannot be larger than maxLength")
        }
    }
}