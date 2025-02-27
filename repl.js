const readline = require("readline");
const run = require("./src/index.cjs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "IndoScript> ",
});

const context = {}; // Initialize the context object

console.log("IndoScript REPL - Ketik 'keluar' untuk keluar.");
rl.prompt();

rl.on("line", (line) => {
  if (line.trim().toLowerCase() === "keluar") {
    rl.close();
    return;
  }

  try {
    run(line, context); // Pass the context object
  } catch (err) {
    console.error("Error:", err.message);
  }

  rl.prompt();
}).on("close", () => {
  console.log("Sampai jumpa!");
  process.exit(0);
});
