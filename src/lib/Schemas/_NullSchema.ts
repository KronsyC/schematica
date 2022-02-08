import {BaseSchema, BaseSchemaTemplate} from '.';

export interface NullSchemaTemplate extends BaseSchemaTemplate{
    type: "null"
}

export class NullSchema extends BaseSchema<NullSchemaTemplate>{

    constructor(template:NullSchemaTemplate){
        super(template)
        this.validateSchema()
    }

    override validateSchema(): void {
        // Null has no validation logic
    }
}