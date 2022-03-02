export default class ERR_INVALID_RANGE extends Error{
    constructor(message:string="An invalid range was provided to the schema"){
        super(message)
        this.name="ERR_INVALID_RANGE"
    }
}