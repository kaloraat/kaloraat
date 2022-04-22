#!/usr/bin/env node

const mongoose = require("mongoose");
const prompt = require("prompt-sync")({ sigint: true });
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const packageJson = () => `
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "nodemon -r esm index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@sendgrid/mail": "^7.6.0",
    "bcrypt": "^5.0.1",
    "cors": "^2.8.5",
    "dotenv": "^10.0.0",
    "esm": "^3.2.25",
    "express": "^4.17.1",
    "express-jwt": "^6.1.0",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^6.0.12",
    "morgan": "^1.10.0",
    "nanoid": "^2.1.11"
  }
}
`;

const envFile = () => `
# DATABASE=mongodb+srv://dbuser:dbpassword@your_db_name.pbn7j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
DATABASE=mongodb://localhost:27017/dbname
JWT_SECRET=some_secret_letters_numbers
SENDGRID_KEY=SG.your.secret-key
EMAIL_FROM=yourname@gmail.com
`;

const gitIgnoreFile = () => `
node_modules
.env
`;

const userModelFile = () => `
import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 64,
    },
    role: {
      type: String,
      default: "Subscriber",
    },
    image: {
      public_id: "",
      url: "",
    },
    resetCode: "",
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
`;

const helpersAuthFile = () => `
import bcrypt from 'bcrypt';

exports.hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

exports.comparePassword = (password, hashed) => {
  return bcrypt.compare(password, hashed);
};
`;

const authControllerFile = () => `
import User from "../models/user";
import { hashPassword, comparePassword } from "../helpers/auth";
import jwt from "jsonwebtoken";
import nanoid from "nanoid";

// sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_KEY);

exports.signup = async (req, res) => {
  console.log("HIT SIGNUP");
  try {
    // validation
    const { name, email, password } = req.body;
    if (!name) {
      return res.json({
        error: "Name is required",
      });
    }
    if (!email) {
      return res.json({
        error: "Email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: "Email is taken",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);

    try {
      const user = await new User({
        name,
        email,
        password: hashedPassword,
      }).save();

      // create signed token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      //   console.log(user);
      const { password, ...rest } = user._doc;
      return res.json({
        token,
        user: rest,
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.signin = async (req, res) => {
  // console.log(req.body);
  try {
    const { email, password } = req.body;
    // check if our db has user with that email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "No user found",
      });
    }
    // check password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({
        error: "Wrong password",
      });
    }
    // create signed token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.password = undefined;
    user.secret = undefined;
    res.json({
      token,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  // find user by email
  const user = await User.findOne({ email });
  console.log("USER ===> ", user);
  if (!user) {
    return res.json({ error: "User not found" });
  }
  // generate code
  const resetCode = nanoid(5).toUpperCase();
  // save to db
  user.resetCode = resetCode;
  user.save();
  // prepare email
  const emailData = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Password reset code",
    html: "<h1>Your password  reset code is: {resetCode}</h1>"
  };
  // send email
  try {
    const data = await sgMail.send(emailData);
    console.log(data);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.json({ ok: false });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password, resetCode } = req.body;
    // find user based on email and resetCode
    const user = await User.findOne({ email, resetCode });
    // if user not found
    if (!user) {
      return res.json({ error: "Email or reset code is invalid" });
    }
    // if password is short
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetCode = "";
    user.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};
`;

const routesFile = () => `
import express from "express";

const router = express.Router();

// controllers
const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

router.get("/", (req, res) => {
  return res.json({
    data: "hello world from kaloraat auth API",
  });
});
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
`;

const serverFile = () => `
require("dotenv").config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth";

const morgan = require("morgan");

const app = express();

// db connection
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB CONNECTION ERROR: ", err));

// middlewares
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// route middlewares
app.use("/api", authRoutes);

app.listen(8000, () => console.log("Server running on port 8000"));
`;

//With readline
// let name = prompt("Write a name to your server/API: ");
// name = name.toLowerCase();

console.log(
  chalk.green.bold(`Generating node server/API with full authentication...`)
);

// package.json
fs.writeFile(
  path.join(`${process.cwd()}`, `package.json`),
  packageJson(),
  (err) => {
    if (err) throw err;
    else console.log(chalk.bold(`package.json is created`));
  }
);
// .env
fs.writeFile(path.join(`${process.cwd()}`, `.env`), envFile(), (err) => {
  if (err) throw err;
  else console.log(chalk.bold(`.env is created`));
});
// .gitignore
fs.writeFile(
  path.join(`${process.cwd()}`, `.gitignore`),
  gitIgnoreFile(),
  (err) => {
    if (err) throw err;
    else console.log(chalk.bold(`.gitignore is created`));
  }
);
// models/user
try {
  fs.mkdirSync(`${process.cwd()}/models`, { recursive: true });
} catch (e) {
  console.log("Cannot create folder ", e);
}
fs.writeFile(
  path.join(`${process.cwd()}/models`, `user.js`),
  userModelFile(),
  (err) => {
    if (err) throw err;
    else console.log(chalk.bold(`/models/user.js is created`));
  }
);
// helpers/auth
try {
  fs.mkdirSync(`${process.cwd()}/helpers`, { recursive: true });
} catch (e) {
  console.log("Cannot create folder ", e);
}
fs.writeFile(
  path.join(`${process.cwd()}/helpers`, `auth.js`),
  helpersAuthFile(),
  (err) => {
    if (err) throw err;
    else console.log(chalk.bold(`/helpers/auth.js is created`));
  }
);
// controllers/auth
try {
  fs.mkdirSync(`${process.cwd()}/controllers`, { recursive: true });
} catch (e) {
  console.log("Cannot create folder ", e);
}
fs.writeFile(
  path.join(`${process.cwd()}/controllers`, `auth.js`),
  authControllerFile(),
  (err) => {
    if (err) throw err;
    else console.log(chalk.bold(`/controllers/auth.js is created`));
  }
);
// routes/auth
try {
  fs.mkdirSync(`${process.cwd()}/routes`, { recursive: true });
} catch (e) {
  console.log("Cannot create folder ", e);
}
fs.writeFile(
  path.join(`${process.cwd()}/routes`, `auth.js`),
  routesFile(),
  (err) => {
    if (err) throw err;
    else console.log(chalk.bold(`/routes/auth.js is created`));
  }
);
// server.js
fs.writeFile(path.join(`${process.cwd()}`, `index.js`), serverFile(), (err) => {
  if (err) throw err;
  else console.log(chalk.bold(`/index.js is created`));
});

setTimeout(() => {
  console.log(
    chalk.green.bold(
      `Update .env variables then run npm install && npm start to see your API running in "http://localhost:8000/api"`
    )
  );
}, 2000);
