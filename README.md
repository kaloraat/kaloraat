# kaloraat

## Helper tool for generating routes, controllers, models and authentication in node and react projects

### how to use

#### Install

`npm i kaloraat -g`

## Generate Node.js server/API with full authentication in seconds

`kaloraat-make-auth`

###### Running authentication project

- Update your `.env` files with real mongodb connection uri and sendgrid api keys
- uncomment `mongoose.connect` function in `index.js`
- uncomment `sgMail.setApiKey()` in `controllers/auth.js`
- then run `npm start`

##### Generate route and controller file

`kaloraat-make-route`

##### Generate model

`kaloraat-make-model`
