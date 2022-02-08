export default class ERR_INVALID_DATA extends Error{
    constructor(message:string="Data does not match schema"){
        super(message)
        this.name="ERR_INVALID_DATA"
    }
}