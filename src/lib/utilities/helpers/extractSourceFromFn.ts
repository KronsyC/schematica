/**
 * @param func The Function to extract the source code from
 * 
 * Takes a function and extracts its raw source code
 */

export default function extractSourceFromFn(func: Function){
    let source = func.toString()
    
    // Megamind level shit 
    const endOfSignature = source.indexOf(") {")+3
    
    
    return source.slice(endOfSignature, -1)
}