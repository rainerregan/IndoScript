let recursionDepth = 0;
const MAX_DEPTH = 1000; // Prevent infinite recursion
const DEBUG_MODE = process.env.DEBUG_MODE === "true";

function parse(tokens) {
  let index = 0;

  function parseExpression() {
    if (recursionDepth > MAX_DEPTH) throw new Error("Maximum recursion depth exceeded!");
    recursionDepth++;

    let expr = parsePrimaryExpression();
    if (DEBUG_MODE) console.log("Parsed primary expression", expr); // 🛠 Debugging
    if (!expr) throw new Error(`Invalid expression at position ${index - 1}`);

    while (index < tokens.length) {
      const token = tokens[index];

      if (DEBUG_MODE) console.log(`Parsing token: '${token}' at position ${index}`); // 🛠 Debugging

      if (token === "(") {
        if (DEBUG_MODE) console.log("Function call detected", expr); // 🛠 Debugging
        expr = parseFunctionCall(expr);
      } else if (isBinaryOperator(token)) {
        if (DEBUG_MODE) console.log("Binary operator detected", expr); // 🛠 Debugging
        expr = parseBinaryExpression(expr, token);
      } else if (token === ";") {
        index++;
        break;
      } else if (token === "kembalikan") {
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

    if (DEBUG_MODE) console.log(`Parsing token: '${token}' at position ${index - 1}`); // 🛠 Debugging

    if (token === ";") return parseStatement();
    if (token === "}") return null; // 🚨 Can return null, which might cause issues

    if (token === "atur") {
      return parseVariableDeclaration();
    }

    if (token === "tampilkan") {
      const expr = parseExpression();
      return { type: "PrintStatement", expression: expr };
    }

    if (token === "fungsi") {
      return parseFunctionDeclaration();
    }

    if (token === "kembalikan") {
      const expr = parseExpression();
      return { type: "ReturnStatement", expression: expr };
    }

    if (token === "jika") {
      return parseIfStatement();
    }

    if (token === "selama") {
      return parseWhileStatement();
    }

    if (token.match(/^[A-Za-z_][A-Za-z0-9_]*$/)) {
      if (tokens[index] === "=") {
        return parseAssignmentStatement(token);
      } else if (tokens[index] === "(") {
        index--; // Move back to reprocess as expression
        const expr = parseExpression();
        return { type: "ExpressionStatement", expression: expr };
      }
    }

    console.error("Unexpected token:", token); // 🛠 Debugging
    throw new Error(`Unexpected statement: ${token}`);
  }

  function parseFunctionCall(callee) {
    index++;
    const args = [];
    while (tokens[index] !== ")" && index < tokens.length) {
      args.push(parseExpression());
      if (tokens[index] === ",") index++;
    }
    if (tokens[index] !== ")") throw new Error("Expected closing ')'");
    index++;
    return { type: "FunctionCall", callee, arguments: args };
  }

  function parseBinaryExpression(left, operator) {
    index++;
    const right = parsePrimaryExpression();
    if (!right) throw new Error(`Expected expression after '${operator}'`);
    return { type: "BinaryExpression", operator, left, right };
  }

  function parseVariableDeclaration() {
    const name = tokens[index++];
    if (tokens[index++] !== "=") {
      console.error("Tokens before error:", tokens.slice(index - 5, index + 5));
      throw new Error("Expected '=' after variable name");
    }
    const value = parseExpression();
    return { type: "VariableDeclaration", name, value };
  }

  function parseAssignmentStatement(name) {
    index++; // Skip '='
    const value = parseExpression();
    return { type: "AssignmentStatement", name, value };
  }

  function parseFunctionDeclaration() {
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

  function parseIfStatement() {
    if (tokens[index++] !== "(") throw new Error("Expected '(' after 'jika'");
    const test = parseExpression();
    if (tokens[index++] !== ")") throw new Error("Expected ')' after condition");

    if (tokens[index++] !== "{") throw new Error("Expected '{' after condition");
    const consequent = [];
    while (tokens[index] !== "}" && index < tokens.length) {
      const stmt = parseStatement();
      if (stmt) consequent.push(stmt);
    }
    if (tokens[index] === "}") index++;

    let alternate = null;
    if (tokens[index] === "dan jika") {
      index++;
      alternate = parseIfStatement();
    } else if (tokens[index] === "lainnya") {
      index++;
      if (tokens[index++] !== "{") throw new Error("Expected '{' after 'lainnya'");
      alternate = [];
      while (tokens[index] !== "}" && index < tokens.length) {
        const stmt = parseStatement();
        if (stmt) alternate.push(stmt);
      }
      if (tokens[index] === "}") index++;
    }

    return { type: "IfStatement", test, consequent, alternate };
  }

  function parseWhileStatement() {
    if (tokens[index++] !== "(") throw new Error("Expected '(' after 'selama'");
    const test = parseExpression();
    if (tokens[index++] !== ")") throw new Error("Expected ')' after condition");

    if (tokens[index++] !== "{") throw new Error("Expected '{' after condition");
    const body = [];
    while (tokens[index] !== "}" && index < tokens.length) {
      const stmt = parseStatement();
      if (stmt) body.push(stmt);
    }
    if (tokens[index] === "}") index++;

    return { type: "WhileStatement", test, body };
  }

  function isBinaryOperator(token) {
    return ["+", "-", "*", "/", "==", "!=", ">=", "<=", ">", "<"].includes(token);
  }

  const ast = { type: "Program", body: [] };
  while (index < tokens.length) {
    const stmt = parseStatement();
    if (stmt !== null) { // 🚨 Prevent null from being added
      ast.body.push(stmt);
    }
  }

  if (DEBUG_MODE) console.log("AST:", JSON.stringify(ast, null, 2)); // 🛠 Debugging

  return ast;
}

module.exports = parse;