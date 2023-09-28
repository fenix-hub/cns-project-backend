# CNS Server

This project was created using node (typescript), express and mongodb.

The project was generated using the following command
```
npx --yes --package express-generator express --force --view pug
```

CORS library was added to handle Cross Origin Resource Sharing.
```
npm install cors
```

Mongoose library was used to connect to mongodb.
```
npm install mongoose
```

NodeMon was added as dev dependencies to support running the server and client concurrently and to support hot reloading.
```
npm install --save-dev nodemon
```

Two scripts were added to package.json to support running the server and client concurrently and to support hot reloading.
```
"start": "nodemon app.js"
```

Express Session was added to support session management.
```
npm install express-session
```
The idea is that the session will be stored in the database and the session id will be stored in the cookie.
When the user accesses the frontend for the first time, the frontend will send a request to the backend to create a session.
The backend will create a session in the database and send the session id to the frontend in the form of a cookie.

Websocket and query-string libraries were added to support websocket.
```
npm install ws query-string
```
