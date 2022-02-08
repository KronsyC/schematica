import {BaseSchema, BaseSchemaTemplate} from '.';

export interface BooleanSchemaTemplate extends BaseSchemaTemplate{
    type: "boolean"
}

export class BooleanSchema extends BaseSchema<BooleanSchemaTemplate>{
    constructor(template:BooleanSchemaTemplate){
        super(template)
        this.validateSchema()
    }

    override validateSchema(): void {
        // Boolean has no validation logic
    }
}