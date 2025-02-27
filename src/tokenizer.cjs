function tokenize(code) {
  const tokens = [];
  let i = 0;

  while (i < code.length) {
    const char = code[i];

    if (/\s/.test(char)) {
      i++; // Skip whitespace
      continue;
    }

    // ✅ Handle comments: Skip everything after `//` until newline
    if (char === "/" && code[i + 1] === "/") {
      while (i < code.length && code[i] !== "\n") i++;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let identifier = "";
      while (/[A-Za-z0-9_]/.test(code[i])) identifier += code[i++];
      tokens.push(identifier);
      continue;
    }

    if (/[0-9]/.test(char)) {
      let number = "";
      while (/[0-9]/.test(code[i])) number += code[i++];
      tokens.push(number);
      continue;
    }

    if (char === "=" && code[i + 1] === "=") {
      tokens.push("==");
      i += 2;
      continue;
    }

    if (char === "!" && code[i + 1] === "=") {
      tokens.push("!=");
      i += 2;
      continue;
    }

    if (char === ">" && code[i + 1] === "=") {
      tokens.push(">=");
      i += 2;
      continue;
    }

    if (char === "<" && code[i + 1] === "=") {
      tokens.push("<=");
      i += 2;
      continue;
    }

    if (char === `"`) {
      let str = "";
      i++; // ✅ Skip the opening quote
      while (i < code.length && code[i] !== `"`) {
        str += code[i++];
      }
      i++; // ✅ Skip the closing quote
      tokens.push({ type: "StringLiteral", value: str }); // ✅ Store string properly
      continue;
    }

    if (["+", "-", "*", "/", "(", ")", "{", "}", ",", ";"].includes(char)) {
      tokens.push(char);
      i++;
      continue;
    }

    if (["a", "t", "u", "r"].every((c, j) => code[i + j] === c)) {
      tokens.push("atur");
      i += 4;
      continue;
    }

    if (["t", "a", "m", "p", "i", "l", "k", "a", "n"].every((c, j) => code[i + j] === c)) {
      tokens.push("tampilkan");
      i += 9;
      continue;
    }

    if (["f", "u", "n", "g", "s", "i"].every((c, j) => code[i + j] === c)) {
      tokens.push("fungsi");
      i += 6;
      continue;
    }

    if (["k", "e", "m", "b", "a", "l", "i"].every((c, j) => code[i + j] === c)) {
      tokens.push("kembali");
      i += 7;
      continue;
    }

    tokens.push(char);
    i++;
  }

  return tokens;
}

module.exports = tokenize;