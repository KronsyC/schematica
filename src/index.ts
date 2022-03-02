
import Validator from "./lib/Validator/Validator"
import Schematica from "./Schematica"
import Parser from "./lib/Parser/Parser"
import Encoder from "./lib/Encoder/Encoder"
import Presets from "./Schemas"

// module.exports = exports = Schematica
// Object.defineProperty(exports, "__esModule", {value: true})

export * from "./Schemas"
export {
    Validator,
    Parser,
    Encoder,
    Presets as presets
}
export default Schematica