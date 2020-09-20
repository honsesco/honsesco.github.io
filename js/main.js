const fieldInput = document.getElementById('input')
const fieldOutput = document.querySelector('#result')
const variables = document.querySelector('.variables-set')
let countOfValues = 1;

const parseHandler = () => {
    collectVariables()
    let text = fieldInput.value
    let result = parse(text.trim())
    if (result == 'error') {
        result = text;
    } else {
        result = colorize(result)
    }
    fieldOutput.innerHTML = result
}

const addValueHandler = () => {
    let value = document.createElement('div')
    value.className = 'variable-' + countOfValues
    value.innerHTML = '<div class="key"><p>key:</p> <input class="variable-key" type="text" placeholder="amount"></div><div class="value"><p>value:</p> <input class="variable-value" type="text" placeholder="1"><button  onclick="removeVariable(\'' + countOfValues + '\');">X</button></div>'
    variables.append(value)
    countOfValues++
}

function collectVariables() {
    clearValues()
    let list = document.querySelectorAll('.variables-set > [class^="variable-"');
    for (let i = 0; i < list.length; i++) {
        let key = list[i].querySelector('.variable-key').value;
        let value = list[i].querySelector('.variable-value').value;
        if (key.length > 0 && value.length > 0) {
            setValue(key, value)
        }
    }
}

function colorize(str) {
    let current = str.indexOf('&')
    if (current == -1) return str
    let result = str.substring(0, current)
    let amountOfResets = 0;

    while (current != -1) {
        if (current >= str.length) break;
        let color = str.charAt(current + 1)
        let style = getStyleByColor(color)

        if (style == '') { // invalid color code
            result += str.indexOf("&", current + 2) == -1 ? str.substring(current) : str.substring(current, str.indexOf("&", current + 2))
        } else if (style == 'r') {// reset colors
            for (let i = 0; i < amountOfResets; i++) result += '</span>'
            amountOfResets = 0
            result += str.indexOf("&", current + 2) == -1 ? str.substring(current + 2) : str.substring(current + 2, str.indexOf("&", current + 2))
        } else { // valid color code
            result += '<span style=\"' + style + '\">' + (str.indexOf("&", current + 2) == -1 ? str.substring(current + 2) : str.substring(current + 2, str.indexOf("&", current + 2)))
            amountOfResets++;
        }

        if (str.indexOf("&", current + 1) == -1) {
            result.substring(current + 2)
            break;
        }
        current = str.indexOf("&", current + 1)
    }
    for (let i = 0; i < amountOfResets; i++) result += '</span>'
    return result;
}
  
function getStyleByColor(id) {
    switch(id) {
        case '0': return 'color: #000000;'
        case '1': return 'color: #0000AA;'
        case '2': return 'color: #00AA00;'
        case '3': return 'color: #00AAAA;'
        case '4': return 'color: #AA0000;'
        case '5': return 'color: #AA00AA;'
        case '6': return 'color: #FFAA00;'
        case '7': return 'color: #AAAAAA;'
        case '8': return 'color: #555555;'
        case '9': return 'color: #5555FF;'
        case 'a': return 'color: #AA0000;'
        case 'b': return 'color: #55FFFF;'
        case 'c': return 'color: #FF5555;'
        case 'd': return 'color: #FF55FF;'
        case 'e': return 'color: #FFFF55;'
        case 'f': return 'color: #FFFFFF;'
        case 'l': return 'font-weight: bold'
        case 'm': return 'text-decoration: line-through;'
        case 'n': return 'text-decoration: underline;'
        case 'o': return 'font-style: italic;'
        case 'r': return 'r'
        default: return '';
    }
}

function removeVariable(num) {
    let v = document.querySelector('.variable-' + num)
    if (v) v.remove()
}

document.getElementById('parse-btn').addEventListener('click', parseHandler);
document.getElementById('add-value-btn').addEventListener('click', addValueHandler);







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

function parseNumber(toParse) {
    return Number(toParse)
}

function setValue(key, value) {
    values.set(key, value);
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

function isNumber(str) {
    return !isNaN(str)
}

function isString(str) {
    str = str.trim()
    let a = str.charAt(0)
    let b = str.charAt(str.length - 1);
    if (str.startsWith('"')) {
      return a == '"' && b == '"' && str.length > 1
    } else if (str.startsWith("'")) {
      return a == "'" && b == "'" && str.length > 1
    } else {
      return false
    }
}

function getStringContent(str) {
    str = str.trim()
    if (str.startsWith('"') || str.startsWith("'")) {
      if (str.length == 2) return ''
      return str.substring(1, str.length - 1)
    }
    return str
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
        return input
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
    if (a != -1 && b != -1 && a < b) {
      let fun = name.substring(0, a).trim()
      if (fun.startsWith('=')) fun = fun.substring(1)
      return functions.includes(fun)
    }
    return false;
}

function hasCode(input, start) {
    let a = input.indexOf("{", start);
    let b = input.lastIndexOf("}");
    return start >= 0 && a != -1 && b != -1 && a < b;
}

function parseFunction(input) {
  if (isFunction(input)) {
      let name = getFunctionName(input);
      if (name.startsWith('=')) name = name.substring(1)
      if (name == "IF") {
          let list = parseComplexList(getFunctionContent(input));
          if (list.length != 3) return "error";
          let condition = list[0]
          if (isBoolean(condition)) return "error"
          condition = parseFunction(condition)
          return condition === "true" ? parseFunction(list[1]) : condition === "false" ? parseFunction(list[2]) : "error";
      } else if (name == "EQ") {
          let list = parseSimpleList(getFunctionContent(input));
          if (list.length != 2) return "error";
          let value1 = getIfExists(list[0]);
          let value2 = getIfExists(list[1]);
          return String(value1 == value2);
      } else if (name == "NE") {
          let list = parseSimpleList(getFunctionContent(input));
          if (list.length != 2) return "error";
          let value1 = getIfExists(list[0]);
          let value2 = getIfExists(list[1]);
          return String(value1 != value2);
      } else if (name == "LTEQ") {
          let list = parseSimpleList(getFunctionContent(input));
          if (list.length != 2) return "error";
          let sValue1 = getIfExists(list[0]);
          let sValue2 = getIfExists(list[1]);
          if (!isNumber(sValue1) || !isNumber(sValue2)) return "error";
          return String(parseNumber(sValue1) <= parseNumber(sValue2));
      } else if (name == "LT") {
          let list = parseSimpleList(getFunctionContent(input));
          if (list.length != 2) return "error";
          let sValue1 = getIfExists(list[0]);
          let sValue2 = getIfExists(list[1]);
          if (!isNumber(sValue1) || !isNumber(sValue2)) return "error";
          return String(parseNumber(sValue1) < parseNumber(sValue2));
      } else if (name == "GTEQ") {
          let list = parseSimpleList(getFunctionContent(input));
          if (list.length != 2) return "error";
          let sValue1 = getIfExists(list[0]);
          let sValue2 = getIfExists(list[1]);
          if (!isNumber(sValue1) || !isNumber(sValue2)) return "error";
          return String(parseNumber(sValue1) >= parseNumber(sValue2));
      } else if (name == "GT") {
          let list = parseSimpleList(getFunctionContent(input));
          if (list.length != 2) return "error";
          let sValue1 = getIfExists(list[0]);
          let sValue2 = getIfExists(list[1]);
          if (!isNumber(sValue1) || !isNumber(sValue2)) return "error";
          return String(parseNumber(sValue1) > parseNumber(sValue2));
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
          if (!isNumber(sValue1) || !isNumber(sValue2)) return "error";
          return String(parseNumber(sValue1) + parseNumber(sValue2));
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
          return isBoolean(parsed) ? String(parsed !== 'true') : "error";
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
          if (!isNumber(sValue1) || !isNumber(sValue2)) return "error";
          return String(parseNumber(sValue1) / parseNumber(sValue2));
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
          if (!isNumber(sValue1) || !isNumber(sValue2)) return "error";
          return String(parseNumber(sValue1) * parseNumber(sValue2));
      } else if (name == "MOD") {
          let list = parseSimpleList(getFunctionContent(input));
          if (list.length != 2) return "error";
          let sValue1 = getIfExists(list[0]);
          let sValue2 = getIfExists(list[1]);
          if (!isNumber(sValue1) || !isNumber(sValue2)) return "error";
          return String(parseNumber(sValue1) % parseNumber(sValue2));
      } else if (name == "SUB") {
          let list = parseSimpleList(getFunctionContent(input));
          if (list.length != 2) return "error";
          let sValue1 = getIfExists(list[0]);
          let sValue2 = getIfExists(list[1]);
          if (!isNumber(sValue1) || !isNumber(sValue2)) return "error";
          return String(parseNumber(sValue1) - parseNumber(sValue2));
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
    let stringChar = 0; // 0 - none, 1 - ', 2 - "
    let a = 0;    // '
    let ba = 0;   // {
    let bb = 0;   // }
    let ca = 0;   // (
    let cb = 0;   // )
    let d = 0;    // "

    let current = start;

    while (input.length > current) {
        let symbol = input.charAt(current);

        if (symbol == '\'') {
          if (stringChar == 0) stringChar = 1
          a++;
        } else if (symbol == '"') {
          if (stringChar == 0) stringChar = 2
          d++;
        }
        else if (symbol == '{') ba++;
        else if (symbol == '}') bb++;
        else if (symbol == '(') ca++;
        else if (symbol == ')') cb++;
        else if (symbol == ',' && a >= 0 && ba >= 0 && ca >= 0 && ba == bb && ca == cb &&
            (stringChar == 0 || stringChar == 1 && a % 2 == 0 || stringChar == 2 && d % 2 == 0)) {
          return input.substring(start, current);
        } else {
            current++;
            continue;
        }

        if (a >= 0 && ba >= 0 && ca >= 0 && ba == bb && ca == cb &&
            (stringChar == 0 || stringChar == 1 && a % 2 == 0 || stringChar == 2 && d % 2 == 0)) {
          return input.substring(start, current + 1);
        }

        current++;
    }
    if (a >= 0 && ba >= 0 && ca >= 0 && ba == bb && ca == cb &&
        (stringChar == 0 || stringChar == 1 && a % 2 == 0 || stringChar == 2 && d % 2 == 0)) {
      return input.substring(start);
    }
    return "error";
}

function parseSimpleList(input) {
    let list = []
    let l = input.split(',')
    for (let i = 0; i < l.length; i++) {
        list.push(l[i].trim());
    }
    return list
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
