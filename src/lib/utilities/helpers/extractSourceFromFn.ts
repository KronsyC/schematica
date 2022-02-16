/**
 * @param func The Function to extract the source code from
 * 
 * Takes a function and extracts its raw source code
 */

export default function extractSourceFromFn(func: Function){
    let source = func.toString()
    
    // Megamind level shit 
    source= source.split("\n").slice(2, -1).join("\n")
    return source
}