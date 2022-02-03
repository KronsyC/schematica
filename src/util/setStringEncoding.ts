import { TextEncoding } from "../types/types";

export default function setStringEndoding(text:string, encoding:TextEncoding) : string{
    let returnValue = "";
    switch(encoding){
        case "utf8": case "ascii":
            // 128 total character values
            for(let char of text){
                if(char.charCodeAt(0)<=127){
                    returnValue+=char
                }
            }
            break;
        case "unicode":
           for(let char of text){
               console.log(char.charCodeAt(0));
               if(char.charCodeAt(0)<=1_111_998){
                returnValue+=char
               }
               
           }
            break;
    }
    return returnValue
}