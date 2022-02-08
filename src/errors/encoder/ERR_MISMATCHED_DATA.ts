export default class ERR_MISMATCHED_DATA extends Error{
    constructor(message:string="Data provided to the serializer does not match the schema") {
        super(message)
        this.name="ERR_MISMATCHED_DATA"
    }
}