

function decode_entities(text : string) : string {
  const translate_re = 
    /&(nbsp|amp|quot|lt|gt);/
  const translate = 
    { "nbsp":" "
    , "amp" : "&"
    , "quot": "\""
    , "lt"  : "<"
    , "gt"  : ">"
    } as Record<string, string>
  
  return text.replace(translate_re, 
    (_, entity) => translate[entity])
}
export function decode (text : string) : string {
  return decode_entities(text)
}