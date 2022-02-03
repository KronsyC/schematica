export default class ERR_INVALID_RANGE extends Error{
    constructor(message:string="The range provided is not valid"){
        super(message)
        this.name="ERR_INVALID_RANGE"
    }
}