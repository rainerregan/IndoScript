let recursionDepth = 0;
const MAX_DEPTH = 1000; // Prevent infinite recursion

export function tokenize(code) {
    const tokens = [];
    let i = 0;

    while (i < code.length) {
        const char = code[i];

        if (/\s/.test(char)) {
            i++; // Skip whitespace
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
            i++; // Skip the opening quote
            while (i < code.length && code[i] !== `"`) str += code[i++];
            i++; // Skip closing quote
            tokens.push(`"${str}"`);
            continue;
        }

        tokens.push(char);
        i++;
    }

    return tokens;
}

export function parse(tokens) {
    let index = 0;

    function parseExpression() {
        if (recursionDepth > MAX_DEPTH) throw new Error("Maximum recursion depth exceeded!");
        recursionDepth++;

        let expr = parsePrimaryExpression();

        while (index < tokens.length) {
            const token = tokens[index];

            if (["+", "-", "*", "/", "==", "!=", ">=", "<="].includes(token)) {
                index++;
                const right = parsePrimaryExpression();
                expr = { type: "BinaryExpression", operator: token, left: expr, right };
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
        if (token.match(/^[A-Za-z_][A-Za-z0-9_]*$/)) return { type: "Identifier", name: token };
        if (token === "(") {
            const expr = parseExpression();
            if (tokens[index++] !== ")") throw new Error(`Expected ')' but got '${tokens[index - 1]}'`);
            return expr;
        }
    
        throw new Error(`Unexpected token: '${token}' at position ${index - 1}`);
    }
    

    function parseStatement() {
        if (index >= tokens.length) return null; // ✅ Prevent reading undefined

        const token = tokens[index++];
        // ✅ Skip semicolons (ignore them)
        if (token === ";") {
            return parseStatement();
        }

        // ✅ Handle closing brace correctly
        if (token === "}") {
            return null; // Stop parsing inside a function block
        }

        if (token === "atur") {
            const name = tokens[index++];
            if (tokens[index++] !== "=") throw new Error("Expected '='");
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
            index++; // ✅ Ensure '}' is skipped
            return { type: "FunctionDeclaration", name, params, body };
        }
        if (token === "kembali") {
            const expr = parseExpression();
            return { type: "ReturnStatement", expression: expr };
        }
        throw new Error(`Unexpected statement: ${token}`);
    }

    const ast = { type: "Program", body: [] };
    while (index < tokens.length) {
        ast.body.push(parseStatement());
    }
    return ast;
}

export function interpret(ast, env = {}) {
    function evaluate(node, scope = env) {
        switch (node.type) {
            case "NumberLiteral":
                return node.value;
            case "Identifier":
                if (node.name in scope) return scope[node.name];
                throw new Error(`Undefined variable: ${node.name}`);
            case "VariableDeclaration":
                scope[node.name] = evaluate(node.value, scope);
                return null;
            case "PrintStatement":
                console.log(evaluate(node.expression, scope));
                return null;
            case "FunctionDeclaration":
                scope[node.name] = (...args) => {
                    const localScope = { ...scope }; // ✅ Separate function scope
                    node.params.forEach((param, i) => (localScope[param] = args[i]));
                    let result = null;
                    for (const statement of node.body) {
                        if (statement.type === "ReturnStatement") {
                            result = evaluate(statement.expression, localScope);
                            break;
                        }
                        evaluate(statement, localScope);
                    }
                    return result;
                };
                return null;
            case "ReturnStatement":
                return evaluate(node.expression, scope);
            case "BinaryExpression":
                const left = evaluate(node.left, scope);
                const right = evaluate(node.right, scope);
                switch (node.operator) {
                    case "+": return left + right;
                    case "-": return left - right;
                    case "*": return left * right;
                    case "/": return right !== 0 ? left / right : NaN;
                    case "==": return left === right;
                    case "!=": return left !== right;
                    case ">=": return left >= right;
                    case "<=": return left <= right;
                    default: throw new Error(`Unsupported operator: ${node.operator}`);
                }
        }
    }

    for (const statement of ast.body) evaluate(statement);
}
