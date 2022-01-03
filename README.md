# kaloraat

## Helper tool for generating routes, controllers, models and authentication in node and react projects

### how to use

#### Install

`npm i -g kaloraat`

## Generate Node.js server/API with full authentication in seconds

### Crerate a project folder for your server/API

#### Get insnide your project folder and run `kaloraat-make-auth`

###### Running authentication project

- Update your `.env` files with real mongodb connection uri and sendgrid api keys
- Get inside your project and run `npm install`
- Then run `npm start` to start your node server/API with full authentication
- Visit http://localhost:8000/api to check your server/API running
- Each time you add a new route file inside `routes` folder, make sure to import and apply as middleware in `index.js`
- For reset password email, make sure to check spam folder in your mailbox
- To see all available API endpoints, checkout `routes/auth.js`

##### Generate route and controller file

`kaloraat-make-route`

##### Generate model

`kaloraat-make-model`
