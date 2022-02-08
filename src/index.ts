export * from "./types/schemas"
export * from "./types/types"
export * from "./errors/schema/ERR_INVALID_RANGE"
export * from "./errors/schema/ERR_TYPE_MISMATCH"
export * from "./errors/JSONworks/ERR_UNKNOWN_REF"
import Validator from "./lib/Validator/Validator"
import Schema from "./lib/Schema"
import JSONworks from "./JSONworks"
import Parser from "./lib/Parser/Parser"
import Encoder from "./lib/Encoder/Encoder"
import Presets from "./lib/presets"
export {
    Validator,
    Schema,
    Parser,
    Encoder,
    Presets as presets
}
export default JSONworks