import fs from "fs";
import { tokenize, parse, interpret } from "./src/indoscript-core.mjs";

const filename = process.argv[2];
if (!filename || !filename.endsWith(".is")) {
    console.error("Gunakan: indo <file>.is");
    process.exit(1);
}

fs.readFile(filename, "utf8", (err, code) => {
    if (err) {
        console.error("Gagal membaca file:", err);
        process.exit(1);
    }
    const tokens = tokenize(code);
    const ast = parse(tokens);
    interpret(ast);
});
