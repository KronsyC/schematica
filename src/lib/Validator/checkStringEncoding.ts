import { TextEncoding } from "../../types/types";

const checkStringEncoding = (function(
    text: string,
    encoding: TextEncoding
): boolean {
    switch (encoding) {
        case "utf8":
        case "ascii":
            // 128 total character values
            for (let char of text) {
                if (char.charCodeAt(0) > 127) {
                    return false;
                }
            }
            break;
        case "unicode":
            return true // I know this is terrible and may fail, but it's optimized TODO: Make this actually check
    }
    return true;
})
export default checkStringEncoding
