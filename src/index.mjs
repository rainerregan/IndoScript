import { tokenize } from "./tokenizer.mjs";
import { parse } from "./parser.mjs";
import { interpret } from "./interpreter.mjs";

function run(code, context) {
  const tokens = tokenize(code);
  const ast = parse(tokens);
  interpret(ast, context);
}

export default run;