export default class ERR_UNKNOWN_REF extends Error{
    constructor(message:string="Ref Not Found") {
        super(message)
        this.name="ERR_UNKNOWN_REF"
    }
}