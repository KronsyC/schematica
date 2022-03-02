

// These chars are guaranteed to work as the first char of a varname
const strict_safe_chars:string[] = []

for(let i = 65;i<91;i++){
    strict_safe_chars.push(String.fromCharCode(i))
}
for(let i = 97;i<123;i++){
    strict_safe_chars.push(String.fromCharCode(i))
}
strict_safe_chars.push("$")
strict_safe_chars.push("_")

// These characters can appear in variables but not the first character
const safe_chars:string[] = [...strict_safe_chars]
for(let i = 48;i<58;i++){
    safe_chars.push(String.fromCharCode(i))
}

function getRandIndex(arr:any[]){
    return Math.floor(Math.random()*arr.length)

}

export default function genId(length:number=10):string{
    let id:string = "";
    for(let i = 0; i<length;i++){
        if(i===0){
            id+=strict_safe_chars[getRandIndex(strict_safe_chars)]
        }
        else{
            id+=safe_chars[getRandIndex(safe_chars)]

        }
    }
    return id
}