# kaloraat

## Helper tool for generating NodeJs API with Full Authentication 🐸

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

- Update your `.env` files with real mongodb connection uri and sendgrid api keys
- Get inside your project and run `npm install`
- Then run `npm start` to start your node server/API with full authentication
- Visit http://localhost:8000/api to check your server/API running

##### Generate route and controller file

`kaloraat-make-route`

##### Generate model

`kaloraat-make-model`
