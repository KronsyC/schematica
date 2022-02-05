import { presets } from ".";
import JSONworks from "./JSONworks";


const jw = new JSONworks()


console.log(jw.buildValidator(presets.email)("Hello@wrld.io"))

// Dont exit ts-node-dev
while(true){}