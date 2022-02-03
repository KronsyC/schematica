import { TextEncoding } from "../types/types";

export default function checkStringEncoding(
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
            for (let char of text) {
                console.log(char.charCodeAt(0));
                if (char.charCodeAt(0) > 1_111_998) {
                    return false;
                }
            }
            break;
    }
    return true;
}
