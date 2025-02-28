const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

function interpret(ast, env = {}) {
  if (DEBUG_MODE) console.log("AST before interpretation:", JSON.stringify(ast, null, 2));

  function evaluate(node, currentEnv) {
    if (!node) {
      throw new Error("Unexpected null AST node");
    }

    if (DEBUG_MODE) console.log(`Evaluating node: ${JSON.stringify(node)}`, `With env:`, env);

    switch (node.type) {
      case "NumberLiteral":
        return node.value;
      case "StringLiteral":
        return node.value;
      case "BooleanLiteral":
        return node.value;
      case "ArrayLiteral":
        return evaluateArrayLiteral(node, currentEnv);
      case "ArrayAccess":
        return evaluateArrayAccess(node, currentEnv);
      case "PropertyAccess":
        return evaluatePropertyAccess(node, currentEnv);
      case "MethodCall":
        return evaluateMethodCall(node, currentEnv);
      case "Identifier":
        return evaluateIdentifier(node, currentEnv);
      case "VariableDeclaration":
        return evaluateVariableDeclaration(node, currentEnv);
      case "AssignmentStatement":
        return evaluateAssignmentStatement(node, currentEnv);
      case "PrintStatement":
        return evaluatePrintStatement(node, currentEnv);
      case "BinaryExpression":
        return evaluateBinaryExpression(node, currentEnv);
      case "FunctionCall":
        return evaluateFunctionCall(node, currentEnv);
      case "FunctionDeclaration":
        return evaluateFunctionDeclaration(node, currentEnv);
      case "ArrowFunction":
        return evaluateArrowFunction(node, currentEnv);
      case "ExpressionStatement":
        return evaluate(node.expression, currentEnv);
      case "ReturnStatement":
        return evaluate(node.expression, currentEnv);
      case "IfStatement":
        return evaluateIfStatement(node, currentEnv);
      case "WhileStatement":
        return evaluateWhileStatement(node, currentEnv);
      case "ForStatement":
        return evaluateForStatement(node, currentEnv);
      case "ForEachStatement":
        return evaluateForEachStatement(node, currentEnv);
      default:
        throw new Error(`Unknown AST node type: ${node.type}`);
    }
  }

  function evaluateArrayLiteral(node, currentEnv) {
    return node.elements.reduce((acc, element) => {
      if (element.type === "SpreadElement") {
        return [...acc, ...evaluate(element.argument, currentEnv)];
      }
      return [...acc, evaluate(element, currentEnv)];
    }, []);
  }

  function evaluateArrayAccess(node, currentEnv) {
    const array = evaluate(node.array, currentEnv);
    const index = evaluate(node.index, currentEnv);
    if (!Array.isArray(array)) {
      throw new Error(`'${node.array.name}' is not an array`);
    }
    return array[index];
  }

  function evaluatePropertyAccess(node, currentEnv) {
    const object = evaluate(node.object, currentEnv);
    if (node.property === "length") {
      if (!Array.isArray(object)) {
        throw new Error(`'${node.object.name}' is not an array`);
      }
      return object.length;
    }
    throw new Error(`Unknown property: ${node.property}`);
  }

  function evaluateMethodCall(node, currentEnv) {
    const object = evaluate(node.object, currentEnv);
    const args = node.arguments.map(arg => evaluate(arg, currentEnv));
    console.log("MethodCall", node, object, args);

    if (node.method === "push") {
      if (!Array.isArray(object)) {
        throw new Error(`'${node.object.name}' is not an array`);
      }

      return [...object, ...args];
    } else if (node.method === "forEach") {
      if (!Array.isArray(object)) {
        throw new Error(`'${node.object.name}' is not an array`);
      }
      const callback = args[0];
      if (typeof callback !== "function") {
        throw new Error(`'${callback}' is not a function`);
      }
      object.forEach((item, index) => {
        callback(item, index);
      });
      return null;
    }
    throw new Error(`Unknown method: ${node.method}`);
  }

  function evaluateIdentifier(node, currentEnv) {
    if (DEBUG_MODE) console.log(`Checking if '${node.name}' is in env`, currentEnv);
    if (!(node.name in currentEnv)) {
      throw new Error(`Undefined variable: ${node.name}`);
    }
    if (DEBUG_MODE) console.log(`Resolved Identifier '${node.name}' to`, currentEnv[node.name]);
    return currentEnv[node.name];
  }

  function evaluateVariableDeclaration(node, currentEnv) {
    currentEnv[node.name] = evaluate(node.value, currentEnv);
    return null;
  }

  function evaluateAssignmentStatement(node, currentEnv) {
    if (!(node.name in currentEnv)) {
      throw new Error(`Undefined variable: ${node.name}`);
    }
    currentEnv[node.name] = evaluate(node.value, currentEnv);
    return null;
  }

  function evaluatePrintStatement(node, currentEnv) {
    console.log(evaluate(node.expression, currentEnv));
    return null;
  }

  function evaluateBinaryExpression(node, currentEnv) {
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
      case ">":
        return left > right;
      case "<":
        return left < right;
      case "&&":
        return left && right;
      case "||":
        return left || right;
      default:
        throw new Error(`Unknown operator: ${node.operator}`);
    }
  }

  function evaluateFunctionCall(node, currentEnv) {
    const func = evaluate(node.callee, currentEnv);
    if (!func || (func.type !== "Function" && func.type !== "ArrowFunction")) {
      throw new Error(`'${node.callee.name}' is not a function`);
    }

    const args = node.arguments.map(arg => evaluate(arg, currentEnv));

    const localEnv = { ...currentEnv };
    func.params.forEach((param, index) => {
      localEnv[param] = args[index];
    });

    let result = null;
    if (DEBUG_MODE) console.log(`Executing function '${node.callee.name}'`, localEnv);
    for (const statement of func.body) {
      if (statement.type === "ReturnStatement") {
        result = evaluate(statement.expression, localEnv);
        break;
      }
      if (DEBUG_MODE) console.log(`Evaluating statement: ${JSON.stringify(statement)}`);
      evaluate(statement, localEnv);
    }
    return result;
  }

  function evaluateFunctionDeclaration(node, currentEnv) {
    if (DEBUG_MODE) console.log(`Declaring function '${node.name}'`, node.params, node.body);
    currentEnv[node.name] = {
      type: "Function",
      params: node.params,
      body: node.body,
    };
    return null;
  }

  function evaluateArrowFunction(node, currentEnv) {
    if (DEBUG_MODE) console.log(`Declaring arrow function '${node.name}'`, node.params, node.body);
    return {
      type: "ArrowFunction",
      params: node.params,
      body: node.body,
    };
  }

  function evaluateIfStatement(node, currentEnv) {
    const test = evaluate(node.test, currentEnv);
    if (test) {
      for (const statement of node.consequent) {
        evaluate(statement, currentEnv);
      }
    } else if (node.alternate) {
      for (const statement of node.alternate) {
        evaluate(statement, currentEnv);
      }
    }
    return null;
  }

  function evaluateWhileStatement(node, currentEnv) {
    while (evaluate(node.test, currentEnv)) {
      for (const statement of node.body) {
        evaluate(statement, currentEnv);
      }
    }
    return null;
  }

  function evaluateForStatement(node, currentEnv) {
    for (evaluate(node.init, currentEnv); evaluate(node.test, currentEnv); evaluate(node.update, currentEnv)) {
      for (const statement of node.body) {
        evaluate(statement, currentEnv);
      }
    }
    return null;
  }

  function evaluateForEachStatement(node, currentEnv) {
    const array = evaluate(node.array, currentEnv);
    if (!Array.isArray(array)) {
      throw new Error(`'${node.array.name}' is not an array`);
    }
    const localEnv = { ...currentEnv };
    for (const element of array) {
      localEnv[node.element] = element;
      for (const statement of node.body) {
        evaluate(statement, localEnv);
      }
    }
    return null;
  }

  for (const statement of ast.body) {
    evaluate(statement, env);
  }
}

module.exports = interpret;