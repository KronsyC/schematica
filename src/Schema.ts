import { SchemaType } from "./types/schemas";
import {Schema as SchemaT} from "./types/schemas"

export default class Schema {
    type: SchemaType;
    name?:string;
    schema: SchemaT;
    cachedValidator?:(data:any)=>boolean;
    constructor(opts: SchemaT) {
        this.name=opts.name
        this.type = opts.type;
        this.schema = opts;
    }

}
