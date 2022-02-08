export default class ERR_MISSING_REQUIRED_PROPERTY extends Error{
    constructor(message:string="A key marked as `required` in the schema was not provided") {
        super(message)
        this.name="ERR_MISSING_REQUIRED_PROPERTY"
    }
}