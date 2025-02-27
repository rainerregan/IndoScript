import readline from "readline";
import run from "./src/index.mjs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "IndoScript> ",
});

console.log("IndoScript REPL - Ketik 'keluar' untuk keluar.");
rl.prompt();

rl.on("line", (line) => {
  if (line.trim().toLowerCase() === "keluar") {
    rl.close();
    return;
  }

  try {
    run(line);
  } catch (err) {
    console.error("Error:", err.message);
  }

  rl.prompt();
}).on("close", () => {
  console.log("Sampai jumpa!");
  process.exit(0);
});
