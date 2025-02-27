let recursionDepth = 0;
const MAX_DEPTH = 1000; // Prevent infinite recursion

function parse(tokens) {
  let index = 0;

  function parseExpression() {
    if (recursionDepth > MAX_DEPTH) throw new Error("Maximum recursion depth exceeded!");
    recursionDepth++;

    let expr = parsePrimaryExpression();
    if (!expr) throw new Error(`Invalid expression at position ${index - 1}`);

    while (index < tokens.length) {
      const token = tokens[index];

      if (token === "(") {
        index++; // ✅ Skip '('
        const args = [];
        while (tokens[index] !== ")" && index < tokens.length) {
          args.push(parseExpression());
          if (tokens[index] === ",") index++; // ✅ Handle multiple arguments
        }
        if (tokens[index] !== ")") throw new Error("Expected closing ')'");
        index++; // ✅ Skip ')'
        expr = { type: "FunctionCall", callee: expr, arguments: args };
      } else if (["+", "-", "*", "/", "==", "!=", ">=", "<="].includes(token)) {
        index++;
        const right = parsePrimaryExpression();
        if (!right) throw new Error(`Expected expression after '${token}'`);
        expr = { type: "BinaryExpression", operator: token, left: expr, right };
      } else if (token === ";") {
        index++;
        break;
      } else if (token === "kembali") {
        index++;
        expr = { type: "ReturnStatement", expression: expr };
        break;
      } else {
        break;
      }
    }

    recursionDepth--;
    return expr;
  }

  function parsePrimaryExpression() {
    if (index >= tokens.length) throw new Error("Unexpected end of input");

    const token = tokens[index++];

    if (!isNaN(token)) return { type: "NumberLiteral", value: Number(token) };
    if (typeof token === "object" && token.type === "StringLiteral") {
      return { type: "StringLiteral", value: token.value }; // ✅ Correctly process string literals
    }
    if (token.match(/^[A-Za-z_][A-Za-z0-9_]*$/)) return { type: "Identifier", name: token };
    if (token === "(") {
      const expr = parseExpression();
      if (tokens[index] !== ")") throw new Error("Expected closing ')'");
      index++;
      return expr;
    }

    throw new Error(`Unexpected token: '${JSON.stringify(token)}' at position ${index - 1}`);
  }

  function parseStatement() {
    if (index >= tokens.length) return null; // 🚨 Prevents reading undefined

    const token = tokens[index++];

    console.log(`Parsing token: '${token}' at position ${index - 1}`); // 🛠 Debugging

    if (token === ";") return parseStatement();
    if (token === "}") return null; // 🚨 Can return null, which might cause issues

    if (token === "atur") {
      const name = tokens[index++];
      if (tokens[index++] !== "=") {
        console.error("Tokens before error:", tokens.slice(index - 5, index + 5));
        throw new Error("Expected '=' after variable name");
      }
      const value = parseExpression();
      return { type: "VariableDeclaration", name, value };
    }

    if (token === "tampilkan") {
      const expr = parseExpression();
      return { type: "PrintStatement", expression: expr };
    }

    if (token === "fungsi") {
      const name = tokens[index++];
      if (tokens[index++] !== "(") throw new Error("Expected '('");
      const params = [];
      while (tokens[index] !== ")") {
        params.push(tokens[index++]);
        if (tokens[index] === ",") index++;
      }
      index++; // Skip ')'
      if (tokens[index++] !== "{") throw new Error("Expected '{'");
      const body = [];
      while (tokens[index] !== "}" && index < tokens.length) {
        const stmt = parseStatement();
        if (stmt) body.push(stmt);
      }
      if (tokens[index] === "}") index++; // ✅ Ensure '}' is skipped
      return { type: "FunctionDeclaration", name, params, body };
    }

    if (token === "kembali") {
      const expr = parseExpression();
      return { type: "ReturnStatement", expression: expr };
    }

    // ✅ Handle function call
    if (token.match(/^[A-Za-z_][A-Za-z0-9_]*$/) && tokens[index] === "(") {
      index--; // Move back to reprocess as expression
      const expr = parseExpression();
      return { type: "ExpressionStatement", expression: expr };
    }

    console.error("Unexpected token:", token); // 🛠 Debugging
    throw new Error(`Unexpected statement: ${token}`);
  }

  const ast = { type: "Program", body: [] };
  while (index < tokens.length) {
    const stmt = parseStatement();
    if (stmt !== null) { // 🚨 Prevent null from being added
      ast.body.push(stmt);
    }
  }
  return ast;
}

module.exports = parse;