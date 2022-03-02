export class ERR_BAD_JSON extends Error{
    constructor(message:string="The data is not valid json"){
        super(message)
        this.name="ERR_BAD_JSON"
    }
}