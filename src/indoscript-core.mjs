export function tokenize(code) {
    const tokens = [];
    const tokenRegex = /\s*(=>|{|}|,|;|\(|\)|\+|\-|\*|\/|=|atur|tampilkan|fungsi|kembali|[A-Za-z_][A-Za-z0-9_]*|\d+)\s*/g;
    let match;
    while ((match = tokenRegex.exec(code)) !== null) {
        tokens.push(match[1]);
    }
    return tokens;
}

export function parse(tokens) {
    let index = 0;

    function parseExpression() {
        const token = tokens[index++];
        if (!isNaN(token)) return { type: "NumberLiteral", value: Number(token) };
        if (token.match(/^[A-Za-z_][A-Za-z0-9_]*$/)) return { type: "Identifier", name: token };
        throw new Error(`Unexpected token: ${token}`);
    }

    function parseStatement() {
        const token = tokens[index++];
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
            while (tokens[index] !== "}") {
                body.push(parseStatement());
            }
            index++; // Skip '}'
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
    function evaluate(node) {
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
                            result = evaluate(statement.expression, localEnv);
                            break;
                        }
                        evaluate(statement, localEnv);
                    }
                    return result;
                };
                return null;
            case "ReturnStatement":
                return evaluate(node.expression);
        }
    }
    for (const statement of ast.body) evaluate(statement);
}
