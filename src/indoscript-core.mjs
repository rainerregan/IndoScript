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
        if (!expr) throw new Error(`Invalid expression at position ${index - 1}`);

        while (index < tokens.length) {
            const token = tokens[index];

            if (["+", "-", "*", "/", "==", "!=", ">=", "<="].includes(token)) {
                index++;
                const right = parsePrimaryExpression();
                if (!right) throw new Error(`Expected expression after '${token}'`);
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
        if (index >= tokens.length) return null; // ✅ Prevents reading undefined

        const token = tokens[index++];

        if (token === ";") return parseStatement(); // ✅ Skip semicolons
        if (token === "}") return null; // ✅ Stop parsing inside a block

        if (token === "atur") {
            const name = tokens[index++];
            if (tokens[index++] !== "=") throw new Error("Expected '=' after variable name");
            const value = parseExpression();
            return { type: "VariableDeclaration", name, value };
        }

        if (token === "tampilkan") {
            const expr = parseExpression();
            return { type: "PrintStatement", expression: expr };
        }

        if (token === "fungsi") {
            const name = tokens[index++];
            if (tokens[index++] !== "(") throw new Error("Expected '(' after function name");
            const params = [];
            while (tokens[index] !== ")") {
                params.push(tokens[index++]);
                if (tokens[index] === ",") index++;
            }
            index++; // Skip ')'
            if (tokens[index++] !== "{") throw new Error("Expected '{' to start function body");
            const body = [];
            while (tokens[index] !== "}" && index < tokens.length) {
                const stmt = parseStatement();
                if (stmt) body.push(stmt);
            }
            if (tokens[index++] !== "}") throw new Error("Expected '}' at the end of function body");
            return { type: "FunctionDeclaration", name, params, body };
        }

        if (token === "kembali") {
            const expr = parseExpression();
            return { type: "ReturnStatement", expression: expr };
        }

        throw new Error(`Unexpected statement: '${token}' at position ${index - 1}`);
    }

    const ast = { type: "Program", body: [] };
    while (index < tokens.length) {
        ast.body.push(parseStatement());
    }
    return ast;
}

export function interpret(ast, env = {}) {
    console.log("AST before interpretation:", JSON.stringify(ast, null, 2));

    function evaluate(node) {
        console.log(`Evaluating node: ${JSON.stringify(node)}`); // Debug AST node

        switch (node.type) {
            case "NumberLiteral":
                return node.value;
            case "Identifier":
                return env[node.name];
            case "VariableDeclaration":
                env[node.name] = evaluate(node.value);
                return null;
            case "PrintStatement":
                console.log(evaluate(node.expression));
                return null;
            case "FunctionDeclaration":
                env[node.name] = (...args) => {
                    const localEnv = { ...env };
                    node.params.forEach((param, i) => (localEnv[param] = args[i]));
                    let result = null;
                    for (const statement of node.body) {
                        if (statement.type === "ReturnStatement") {
                            result = evaluate(statement.expression);
                            break;
                        }
                        evaluate(statement);
                    }
                    return result;
                };
                return null;
            case "ReturnStatement":
                return evaluate(node.expression);
        }

        throw new Error(`Unknown AST node type: ${node.type}`);
    }

    for (const statement of ast.body) evaluate(statement);
}
