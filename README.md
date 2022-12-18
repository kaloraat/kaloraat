## Generat NodeJs MongoDB API with Full Authentication in seconds 🐸

- Ready to use API with login and register system
- Includes forgot password and reset password feature
- Folder structure includig routes and controllers

#### Install Globally

```
sudo npm i -g kaloraat
```

#### Create project

```
mkdir server
cd server
kaloraat-make-auth
```

###### Running project

- Update `config.js` with real mongodb connection uri and sendgrid api keys (for sending email)
- Get inside your project and run `npm install`
- Then run `npm start` to start your node server/API with full authentication
- Visit http://localhost:8000/api to check your server/API running

##### Generate route and controller file

`kaloraat-make-route`

##### Generate model

`kaloraat-make-model`
