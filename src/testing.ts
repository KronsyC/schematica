import { Presets } from ".";
import Schematica from "./Schematica";
const json = new Schematica()



const parser = json.buildParser(Presets.any)

console.log(parser("123"));


// console.log(parsed);











// Dont exit ts-node-dev
while(true){}