#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const prompt = require("prompt-sync")({ sigint: true });
const chalk = require("chalk");

//With readline
let name = prompt("Write your server/API name: ");
name = name.toLowerCase();

try {
  fs.copySync(
    `${process.cwd()}/auth/server`,
    path.join(`${process.cwd()}/${name}`)
  );
  console.log(
    chalk.bold(`Project ${name} with complete authentication ready to go 🚀 `)
  );
  console.log(
    chalk.bold(`Update .env variables then type npm start to see the magic 🐸`)
  );
} catch (err) {
  console.error(err);
}
