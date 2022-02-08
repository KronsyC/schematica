export default class ERR_TYPE_MISMATCH extends Error{
    constructor(message:string="The Data provided to the function does not match the schema") {
        super(message)
        this.name="ERR_TYPE_MISMATCH"
    }
}