
import Validator from "./lib/utilities/Validator/Validator"
import Schematica from "./Schematica"
import Parser from "./lib/utilities/Parser/Parser"
import Encoder from "./lib/utilities/Encoder/Encoder"
import Presets from "./lib/Schemas"

module.exports = exports = Schematica
Object.defineProperty(exports, "__esModule", {value: true})

export * from "./lib/Schemas"
export {
    Validator,
    Parser,
    Encoder,
    Presets as presets
}
export default Schematica