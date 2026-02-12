const extractVariablesFromText = (text) => {
    // New Logic
    // Match anything inside {{ }} or { }
    const tagRegex = /\{{1,2}\s*([#^\/]?)\s*(.+?)\s*\}{1,2}/g;
    
    const variables = new Set();
    let match;
    
    const reserved = new Set(['true', 'false', 'null', 'undefined']);

    while ((match = tagRegex.exec(text)) !== null) {
        const modifier = match[1];
        const content = match[2];

        // Simple variable check
        if (/^[a-zA-Z0-9_]+$/.test(content)) {
            if (!reserved.has(content)) {
                 variables.add(content);
            }
        } else {
            // Complex expression - naive extraction
            // Remove strings first to avoid matching inside them
            const cleanContent = content.replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '');
            
            // Find identifiers NOT preceded by a dot (properties)
            // Note: JS regex lookbehind support depends on Node version, but Node 20 supports it.
            const identifiers = cleanContent.match(/(?<!\.)\b[a-zA-Z_][a-zA-Z0-9_]*\b/g);
            if (identifiers) {
                identifiers.forEach(id => {
                    if (!reserved.has(id)) {
                        variables.add(id);
                    }
                });
            }
        }
    }
    return Array.from(variables);
};

const text1 = "{{ nome }}";
const text2 = "{# nome_autor == 'Rafael' }";
const text3 = "{# user.role == 'admin' }";
const text4 = "{# price > 100 }";

console.log("Text 1 vars:", extractVariablesFromText(text1));
console.log("Text 2 vars:", extractVariablesFromText(text2));
console.log("Text 3 vars:", extractVariablesFromText(text3));
console.log("Text 4 vars:", extractVariablesFromText(text4));
