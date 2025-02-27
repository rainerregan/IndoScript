const fs = require("fs");
const run = require("./src/index.cjs");

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
    run(code);
});
