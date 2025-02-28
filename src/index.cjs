const tokenizer = require("./tokenizer.cjs");
const parser = require("./parser.cjs");
const interpreter = require("./interpreter.cjs");

function run(code, context = {}) {
  try {
    const tokens = tokenizer(code);
    const ast = parser(tokens);
    interpreter(ast, context);
  } catch (error) {
    console.error("🚨 Runtime Error:", error.message);
  }
}

module.exports = run;