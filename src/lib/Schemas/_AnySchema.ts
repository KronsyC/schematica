import { BaseSchemaTemplate } from '.';
import { BaseSchema } from './__BaseSchema';
export interface AnySchemaTemplate extends BaseSchemaTemplate{
    type: "any"
}

export class AnySchema extends BaseSchema<AnySchemaTemplate>{
    typecheck: string = `(!!${this.id})`;
    constructor(template:AnySchemaTemplate){
        super(template)
        this.validateSchema()
    }

    override validateSchema(): void {
        // Any has no validation logic
    }
}