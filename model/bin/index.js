#!/usr/bin/env node

const mongoose = require("mongoose");

const modelFileContent = (name) => `
const ${name}Schema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('${
  name.charAt(0).toUpperCase() + name.slice(1)
}', ${name}Schema);
`;

//With readline
let name = prompt("Write your model name: ");
name = name.toLowerCase();
// create routes file inside routes folder
try {
  fs.mkdirSync(`${process.cwd()}/models`, { recursive: true });
} catch (e) {
  console.log("Cannot create folder ", e);
}
fs.writeFile(
  path.join(`${process.cwd()}/models`, `${name}.js`),
  modelFileContent(name),
  (err) => {
    if (err) throw err;
    else console.log(chalk.bold(`/models/${name}.js is created`));
  }
);
