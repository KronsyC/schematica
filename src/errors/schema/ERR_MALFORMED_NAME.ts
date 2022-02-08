export default class ERR_MALFORMED_NAME extends Error{
    constructor(message:string="Schema names cannot contain any whitespace") {
        super(message)
        this.name="ERR_MALFORMED_NAME"
    }
}