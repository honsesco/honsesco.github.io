/*
    What are you doing here?
*/

const fieldInput = document.getElementById('input')
const fieldOutput = document.getElementById('output')
const variables = document.querySelector('.variables-set')
let countOfValues = 1;

let parseHandler = () => {
    collectVariables()
    let text = fieldInput.value;
    let result = parse(text.trim());
    if (result == 'error') result = text;
    fieldOutput.value = result;
}

let addValueHandler = () => {
    let value = document.createElement('div')
    value.className = 'variable-' + countOfValues
    value.innerHTML = '<p>key:</p><input class="variable-key" type="text" placeholder="amount"><p>value:</p><input class="variable-value" type="text" placeholder="1"><button onclick="removeVariable(\'' + countOfValues + '\');" title="Remove value">X</button>'
    variables.append(value)
    countOfValues++
}

function collectVariables() {
    values.clear()
    var list = document.querySelectorAll('.variables-set > [class^="variable-"');
    for (let i = 0; i < list.length; i++) {
        let key = list[i].querySelector('.variable-key').value;
        let value = list[i].querySelector('.variable-value').value;
        if (key.length > 0 && value.length > 0) {
            values.set(key, value)
        }
    }
}

function removeVariable(num) {
    let v = document.querySelector('.variable-' + num)
    if (v) v.remove()
}

document.getElementById('btn-parse').addEventListener('click', parseHandler);
document.getElementById('btn-add-value').addEventListener('click', addValueHandler);





/*
    StringParser
*/

const functions = ["EQ", "LTEQ", "LT", "GT", "GTEQ", "IF", "CONCAT",
    "ADD", "AND", "NOT", "OR", "ENDSWITH", "STARTSWITH", "NE", "TRUE", "FALSE", "DIV", "JOIN", "MUL",
    "MOD", "SUB"]

const values = new Map();

function isValue(value) {
    return values.has(value);
}

function setValue(key) {
    return values.get(key);
}

function parseInt(toParse) {
    return Number.parseInt(toParse)
}

function setValue(key, value) {
    values.put(key, value);
}

function clearValues() {
    values.clear();
}

function removeValue(key) {
    values.remove(key);
}

function getValue(key) {
    return values.get(key)
}

function getIfExists(key) {
    return isValue(key) ? getValue(key) : key;
}

function isBoolean(str) {
    return str == "true" || str == "false";
}

function isInteger(str) {
    return !isNaN(str) && parseInt(Number(str)) == str && !isNaN(parseInt(str, 10));
}

function isString(str) {
    let a = str.indexOf("'");
    let b = str.lastIndexOf("'");
    return a != -1 && b != -1 && a < b;
}

function getStringContent(str) {
    let a = str.indexOf("'");
    let b = str.lastIndexOf("'");
    return a != -1 && b != -1 && a < b ? str.substring(a + 1, b) : str;
}

function parse(input) {
    return parseCode(input);
}

function parseCode(input) {
    if (hasCode(input, 0)) {
        let result = "";
        let current = input.indexOf("{");
        if (current > 0) result += input.substring(0, current)

        while (hasCode(input, current)) {
            let code = getFunctionBody(input, current);
            if (code == "error") return "error";
            let codeContent = getCodeContent(code);
            let parsedCode = parseFunction(codeContent);
            if (parsedCode == "error") return "error";

            if (codeContent == parsedCode) {
                result += code;
            } else {
                result += parsedCode;
            }

            current += code.length;
            let indexOfOpenedBrace = input.indexOf("{", current);
            if (indexOfOpenedBrace == -1) break;
            result += input.substring(current, indexOfOpenedBrace)
            current = indexOfOpenedBrace;
        }
        if (current >= 0 && current < input.length) result += input.substring(current);
        return result;
    } else {
        return "error";
    }
}

function getFunctionContent(input) {
    let a = input.indexOf("(");
    let b = input.lastIndexOf(")");
    return a == -1 || b == -1 ? input : input.substring(a + 1, b);
}

function getCodeContent(input) {
    let a = input.indexOf("{");
    let b = input.lastIndexOf("}");
    return a == -1 || b == -1 ? input : input.substring(a + 1, b);
}

function getFunctionName(input) {
    let a = input.indexOf("(");
    return a == -1 ? "" : input.substring(0, a).trim();
}

function isFunction(name) {
    let a = name.indexOf("(");
    let b = name.indexOf(")");
    return a != -1 && b != -1 && a < b && functions.includes(name.substring(0, a).trim());
}

function hasCode(input, start) {
    let a = input.indexOf("{", start);
    let b = input.lastIndexOf("}");
    return start >= 0 && a != -1 && b != -1 && a < b;
}

function parseFunction(input) {
    if (isFunction(input)) {
        let name = getFunctionName(input);

        if (name == "IF") {
            let list = parseComplexList(getFunctionContent(input));
            if (list.length != 3) return "error";
            let condition = parseFunction(list[0]);
            return condition == "true" ? parseFunction(list[1]) : condition == "false" ? parseFunction(list[2]) : "error";
        } else if (name == "EQ") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length != 2) return "error";
            let value1 = getIfExists(list[0]);
            let value2 = getIfExists(list[1]);
            return value1 == value2;
        } else if (name == "NE") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length != 2) return "error";
            let value1 = getIfExists(list[0]);
            let value2 = getIfExists(list[1]);
            return value1 != value2;
        } else if (name == "LTEQ") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length != 2) return "error";
            let sValue1 = getIfExists(list[0]);
            let sValue2 = getIfExists(list[1]);
            if (!isInteger(sValue1) || !isInteger(sValue2)) return "error";
            return parseInt(sValue1) <= parseInt(sValue2);
        } else if (name == "LT") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length != 2) return "error";
            let sValue1 = getIfExists(list[0]);
            let sValue2 = getIfExists(list[1]);
            if (!isInteger(sValue1) || !isInteger(sValue2)) return "error";
            return parseInt(sValue1) < parseInt(sValue2);
        } else if (name == "GTEQ") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length != 2) return "error";
            let sValue1 = getIfExists(list[0]);
            let sValue2 = getIfExists(list[1]);
            if (!isInteger(sValue1) || !isInteger(sValue2)) return "error";
            return parseInt(sValue1) >= parseInt(sValue2);
        } else if (name == "GT") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length != 2) return "error";
            let sValue1 = getIfExists(list[0]);
            let sValue2 = getIfExists(list[1]);
            if (!isInteger(sValue1) || !isInteger(sValue2)) return "error";
            return parseInt(sValue1) > parseInt(sValue2);
        } else if (name == "CONCAT") {
            let list = parseComplexList(getFunctionContent(input));
            let sb = "";
            list.forEach(str => {
                let parsed = parseFunction(str);
                if (parsed == "error") return "error";
                sb += parsed;
            });
            return sb;
        } else if (name == "ADD") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length != 2) return "error";
            let sValue1 = getIfExists(list[0]);
            let sValue2 = getIfExists(list[1]);
            if (!isInteger(sValue1) || !isInteger(sValue2)) return "error";
            return parseInt(sValue1) + parseInt(sValue2);
        } else if (name == "AND") {
            let list = parseComplexList(getFunctionContent(input));
            if (list.length == 0) return "error";
            for (let i = 0; i < list.length; i++) {
                let str = list[i]
                if (isBoolean(str)) return "error";
                let parsed = parseFunction(str);
                if (parsed == "false") return "false";
                else if (!parsed == "true") return "error";
            }
            return "true";
        } else if (name == "NOT") {
            let functionContent = getFunctionContent(input);
            if (isBoolean(functionContent)) return "error";
            let parsed = parseFunction(functionContent);
            return isBoolean(parsed) ? parsed !== 'true' : "error";
        } else if (name == "OR") {
            let list = parseComplexList(getFunctionContent(input));
            if (list.length == 0) return "error";
            for (let i = 0; i < list.length; i++) {
                let str = list[i]
                if (isBoolean(str)) return "error";
                let parsed = parseFunction(str);
                if (parsed === 'true') return 'true';
                else if (parsed !== "false") return "error";
            }
            return "false";
        } else if (name == "ENDSWITH") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length <= 1) return "error";
            let value = parseFunction(list[0]);
            for (let i = 1; i < list.length; i++) {
                if (value.endsWith(parseFunction(list[i]))) return "true";
            }
            return "false";
        } else if (name == "STARTSWITH") {

            let list = parseSimpleList(getFunctionContent(input));

            if (list.length <= 1) return "error";
            let value = parseFunction(list[0]);
            for (let i = 1; i < list.length; i++) {
                if (value.startsWith(parseFunction(list[i]))) return "true";
            }
            return "false";
        } else if (name == "DIV") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length != 2) return "error";
            let sValue1 = getIfExists(list[0]);
            let sValue2 = getIfExists(list[1]);
            if (!isInteger(sValue1) || !isInteger(sValue2)) return "error";
            return parseInt(sValue1) / parseInt(sValue2);
        } else if (name == "JOIN") {
            let list = parseComplexList(getFunctionContent(input));
            if (list.length < 2) return "error";
            let separator = parseFunction(list[0]);
            let parsed = []
            for (let i = 1; i < list.length; i++) {
                parsed.push(parseFunction(list[i]));
            }
            return parsed.join(separator)
        } else if (name == "MUL") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length != 2) return "error";
            let sValue1 = getIfExists(list[0]);
            let sValue2 = getIfExists(list[1]);
            if (!isInteger(sValue1) || !isInteger(sValue2)) return "error";
            return parseInt(sValue1) * parseInt(sValue2);
        } else if (name == "MOD") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length != 2) return "error";
            let sValue1 = getIfExists(list[0]);
            let sValue2 = getIfExists(list[1]);
            if (!isInteger(sValue1) || !isInteger(sValue2)) return "error";
            return parseInt(sValue1) % parseInt(sValue2);
        } else if (name == "SUB") {
            let list = parseSimpleList(getFunctionContent(input));
            if (list.length != 2) return "error";
            let sValue1 = getIfExists(list[0]);
            let sValue2 = getIfExists(list[1]);
            if (!isInteger(sValue1) || !isInteger(sValue2)) return "error";
            return parseInt(sValue1) - parseInt(sValue2);
        } else if (name == "TRUE") {
            return "true";
        } else if (name == "FALSE") {
            return "false";
        }

        return "error";
    } else {
        if (isValue(input)) return getValue(input);
        if (hasCode(input, 0)) input = parseCode(input);
        return isString(input) ? getStringContent(input) : input;
    }
}

function getFunctionBody(input, start) {
    let a = 0;    // '
    let ba = 0;   // {
    let bb = 0;   // }
    let ca = 0;   // (
    let cb = 0;   // )

    let current = start;

    while (input.length > current) {
        let symbol = input.charAt(current);

        // for special chars
        if (symbol == '\\') {
            if (current + 1 == input.length) return "error";

            let specialChar = input.charAt(current + 1);
            if (!isSpecialChar(specialChar)) current--;
            current += 2;
            continue;
        }

        if (symbol == '\'') a++;
        else if (symbol == '{') ba++;
        else if (symbol == '}') bb++;
        else if (symbol == '(') ca++;
        else if (symbol == ')') cb++;
        else if (symbol == ',' && a >= 0 && ba >= 0 && ca >= 0 && a % 2 == 0 && ba == bb && ca == cb) {
            return input.substring(start, current);
        } else {
            current++;
            continue;
        }

        if (a >= 0 && ba >= 0 && ca >= 0 && a % 2 == 0 && ba == bb && ca == cb) {
            return input.substring(start, current + 1);
        }

        current++;
    }
    if (a >= 0 && ba >= 0 && ca >= 0 && a % 2 == 0 && ba == bb && ca == cb) return input.substring(start);
    return "error";
}

function isSpecialChar(symbol) {
    return symbol == '\'' || symbol == '(' || symbol == ')' || symbol == '{' || symbol == '}';
}

function parseSimpleList(input) {
    let list = [];
    let l = input.split(',')
    for (let i = 0; i < l.length; i++) {
        list.push(l[i].trim());
    }
    return list;
}

function parseComplexList(input) {
    let start = 0;
    let list = []
    while (input.indexOf(",", start) != -1) {
        let body = getFunctionBody(input, start);
        if (body == "error") return []
        let startsAt = input.indexOf(body, start);
        let comma = input.indexOf(",", startsAt + body.length);
        if (comma == -1) break;
        start = comma + 1;
        list.push(body.trim());
    }
    let lastElement = getFunctionBody(input, start);
    if (lastElement == "error") return []
    list.push(lastElement.trim());
    return list;
}
