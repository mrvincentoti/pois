# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Collaborate on project

To work on project (without docker):

```bash
git clone git@github.com:emekalites/eims.git

cd eims

cp .env.example .env

npm install

npm run start
```

To work on project (with docker):
```bash
git clone git@github.com:emekalites/eims.git

cd eims

npm install

cp .env.example .env

docker-compose -f docker-compose-dev.yml up -d --build
```

To launch the test runner in the interactive watch mode.\

### `npm test`

T build the app for production to the `build` folder. The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run build`

