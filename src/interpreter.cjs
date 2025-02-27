
function interpret(ast, env = {}) {
  console.log("AST before interpretation:", JSON.stringify(ast, null, 2));

  function evaluate(node, currentEnv) {
    if (!node) {
      throw new Error("Unexpected null AST node"); // 🚨 Helps pinpoint the issue
    }

    console.log(`Evaluating node: ${JSON.stringify(node)}`, `With env:`, env); // 🛠 Debug output

    switch (node.type) {
      case "NumberLiteral":
        return node.value;
      case "StringLiteral":
        return node.value;
      case "Identifier":
        console.log(`Checking if '${node.name}' is in env`, currentEnv); // 🛠 Debugging
        if (!(node.name in currentEnv)) {
          throw new Error(`Undefined variable: ${node.name}`);
        }
        console.log(`Resolved Identifier '${node.name}' to`, currentEnv[node.name]); // 🛠 Debugging
        return currentEnv[node.name];
      case "VariableDeclaration":
        currentEnv[node.name] = evaluate(node.value, currentEnv);
        return null;
      case "PrintStatement":
        console.log(evaluate(node.expression, currentEnv));
        return null;
      case "BinaryExpression":
        const left = evaluate(node.left, currentEnv);
        const right = evaluate(node.right, currentEnv);
        switch (node.operator) {
          case "+":
            return left + right;
          case "-":
            return left - right;
          case "*":
            return left * right;
          case "/":
            return left / right;
          case "==":
            return left === right;
          case "!=":
            return left !== right;
          case ">=":
            return left >= right;
          case "<=":
            return left <= right;
          default:
            throw new Error(`Unknown operator: ${node.operator}`);
        }
      case "FunctionCall":
        const func = evaluate(node.callee, currentEnv); // Evaluasi fungsi yang dipanggil
        if (!func || func.type !== "Function") {
          throw new Error(`'${node.callee.name}' is not a function`);
        }

        const args = node.arguments.map(arg => evaluate(arg, currentEnv)); // Evaluasi argument

        // 🔥 BUAT ENVIRONMENT LOKAL UNTUK FUNGSI 🔥
        const localEnv = { ...currentEnv };
        func.params.forEach((param, index) => {
          localEnv[param] = args[index];
        });

        // Eksekusi fungsi dalam environment baru
        let result = null;
        console.log(`Executing function '${node.callee.name}'`, localEnv); // 🛠 Debugging
        for (const statement of func.body) {
          if (statement.type === "ReturnStatement") {
            result = evaluate(statement.expression, localEnv);
            break;
          }
          console.log(`Evaluating statement: ${JSON.stringify(statement)}`); // 🛠 Debugging
          evaluate(statement, localEnv);
        }
        return result;
      case "FunctionDeclaration":
        console.log(`Declaring function '${node.name}'`, node.params, node.body); // 🛠 Debugging
        env[node.name] = {
          type: "Function",
          params: node.params,
          body: node.body,
        };
        return null;
      case "ExpressionStatement":
        return evaluate(node.expression, currentEnv);
      case "ReturnStatement":
        return evaluate(node.expression, currentEnv);
      default:
        throw new Error(`Unknown AST node type: ${node.type}`);
    }
  }

  for (const statement of ast.body) {
    evaluate(statement, env);
  }
}

module.exports = interpret;