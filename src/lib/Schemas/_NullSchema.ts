import BaseSchema, {BaseSchemaTemplate} from './__BaseSchema';

export interface NullSchemaTemplate extends BaseSchemaTemplate{
    type: "null"
}

export default class NullSchema extends BaseSchema<NullSchemaTemplate>{

    constructor(template:NullSchemaTemplate){
        super(template)
        this.validateSchema()
    }

    override validateSchema(): void {
        // Null has no validation logic
    }
}