export * from "./types/schemas"
export * from "./types/types"
export * from "./errors/schema/ERR_INVALID_RANGE"
export * from "./errors/schema/ERR_TYPE_MISMATCH"
export * from "./errors/JSONworks/ERR_UNKNOWN_REF"
import Validator from "./Validator"
import Schema from "./Schema"
import JSONworks from "./JSONworks"
import Parser from "./Parser"
import Encoder from "./Encoder"
import Presets from "./presets"
export {
    Validator,
    Schema,
    Parser,
    Encoder,
    Presets as presets
}
export default JSONworks