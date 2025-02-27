const tokenizer = require("./tokenizer.cjs");
const parser = require("./parser.cjs");
const interpreter = require("./interpreter.cjs");

function run(code, context) {
  const tokens = tokenizer(code);
  const ast = parser(tokens);
  interpreter(ast, context);
}

module.exports = run;