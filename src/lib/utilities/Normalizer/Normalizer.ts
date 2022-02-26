import { GenericSchema } from "../../Schemas";
import Validator from "../Validator/Validator";
import NormalizerBuilder from "./NormalizerBuilder";
interface NormalizerOpts {
    validator?: Validator;
}
export default class Normalizer{
    private validator:Validator;
    private normalizerBuilder:NormalizerBuilder
    constructor(opts:NormalizerOpts){
        this.validator = opts.validator || new Validator()
        this.normalizerBuilder = new NormalizerBuilder(this.validator)
    }




    build(schema:GenericSchema){
        let normalizer;
        normalizer = this.normalizerBuilder.build(schema)
        return normalizer
    }
}