export class ERR_INVALID_DATA extends Error{
    constructor(message:string="The data does not match the schema"){
        super(message)
        this.name="ERR_INVALID_DATA"
    }
}