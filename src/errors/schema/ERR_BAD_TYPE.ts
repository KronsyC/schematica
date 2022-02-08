export default class ERR_BAD_TYPE extends Error{
    constructor(message:string="The Type of the schema is not the same as the type of the builder, please push an issue to github") {
        super(message)
        this.name="ERR_BAD_TYPE"
    }
}