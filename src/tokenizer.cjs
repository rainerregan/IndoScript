function tokenize(code) {
  const tokens = [];
  let i = 0;

  while (i < code.length) {
    const char = code[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (isCommentStart(char, code, i)) {
      i = skipComment(code, i);
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      tokens.push(readIdentifier(code, i));
      i += tokens[tokens.length - 1].length;
      continue;
    }

    if (/[0-9]/.test(char)) {
      tokens.push(readNumber(code, i));
      i += tokens[tokens.length - 1].length;
      continue;
    }

    if (isOperatorStart(char, code, i)) {
      tokens.push(readOperator(code, i));
      i += tokens[tokens.length - 1].length;
      continue;
    }

    if (char === `"`) {
      tokens.push(readStringLiteral(code, i));
      i += tokens[tokens.length - 1].value.length + 2;
      continue;
    }

    if (isSingleCharToken(char)) {
      tokens.push(char);
      i++;
      continue;
    }

    tokens.push(char);
    i++;
  }

  return tokens;
}

function isCommentStart(char, code, i) {
  return char === "/" && code[i + 1] === "/";
}

function skipComment(code, i) {
  while (i < code.length && code[i] !== "\n") i++;
  return i;
}

function readIdentifier(code, i) {
  let identifier = "";
  while (/[A-Za-z0-9_]/.test(code[i])) identifier += code[i++];
  return identifier;
}

function readNumber(code, i) {
  let number = "";
  while (/[0-9]/.test(code[i])) number += code[i++];
  return number;
}

function isOperatorStart(char, code, i) {
  return ["=", "!", ">", "<"].includes(char) && code[i + 1] === "=";
}

function readOperator(code, i) {
  return code[i] + code[i + 1];
}

function readStringLiteral(code, i) {
  let str = "";
  i++;
  while (i < code.length && code[i] !== `"`) {
    str += code[i++];
  }
  return { type: "StringLiteral", value: str };
}

function isSingleCharToken(char) {
  return ["+", "-", "*", "/", "(", ")", "{", "}", ",", ";"].includes(char);
}

module.exports = tokenize;