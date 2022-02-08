
export * from "./lib/Schemas"
import Validator from "./lib/Validator/Validator"
import JSONworks from "./JSONworks"
import Parser from "./lib/Parser/Parser"
import Encoder from "./lib/Encoder/Encoder"
import Presets from "./lib/presets"
export {
    Validator,
    Parser,
    Encoder,
    Presets as presets
}
export default JSONworks