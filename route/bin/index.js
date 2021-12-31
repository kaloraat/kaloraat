#!/usr/bin/env node

const prompt = require("prompt-sync")({ sigint: true });
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const routeFileContent = (name) => `
const express = require("express");

const router = express.Router();

// controllers
const {
 create, read, update, remove
} = "../controllers/${name}";


router.post("/create", create);
router.get("/read", read);
router.put("/update", update);
router.delete("/remove", remove);

module.exports = router;
`;

const controllerFileContent = `
exports.create = async (req, res) => {
  //
};

exports.read = async (req, res) => {
  //
};

exports.update = async (req, res) => {
  //
};

exports.remove = async (req, res) => {
  //
};
`;

//With readline
let name = prompt("Write your route name: ");
name = name.toLowerCase();
// create routes file inside routes folder
try {
  fs.mkdirSync(`${process.cwd()}/routes`, { recursive: true });
  fs.mkdirSync(`${process.cwd()}/controllers`, { recursive: true });
} catch (e) {
  console.log("Cannot create folder ", e);
}
fs.writeFile(
  path.join(`${process.cwd()}/routes`, `${name}.js`),
  routeFileContent(name),
  (err) => {
    if (err) throw err;
    else console.log(chalk.bold(`/routes/${name}.js is created`));
  }
);
fs.writeFile(
  path.join(`${process.cwd()}/controllers`, `${name}.js`),
  controllerFileContent,
  (err) => {
    if (err) throw err;
    else console.log(chalk.bold(`/controllers/${name}.js is created`));
  }
);
