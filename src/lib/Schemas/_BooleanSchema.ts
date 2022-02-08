import BaseSchema, {BaseSchemaTemplate} from './__BaseSchema';

export interface BooleanSchemaTemplate extends BaseSchemaTemplate{
    type: "boolean"
}

export default class BooleanSchema extends BaseSchema<BooleanSchemaTemplate>{

    constructor(template:BooleanSchemaTemplate){
        super(template)
        this.validateSchema()
    }

    override validateSchema(): void {
        // Boolean has no validation logic
    }
}