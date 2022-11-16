# CAMP Proxy

### What is CAMP?
Since my school blocks any ports except for 80 and 443, I made this app. In order to access something hosted on port 3000 you would go to the endpoint /3000 and it takes you there. It also loads /everything/else/not/just/the/home/page

### How does it work?
It works by getting the port number from the URL and then adding it on to a base url (process.env.URL). If there is no port number in the url it tries to get it from the Referer http header. Then, it streams a request to the internal url which looks something like this:
```
http://my.cool.site:3000/
```
and then sends the response back to the client.

### Setup guide
Make sure you duplicate .env.example and name it .env and fill out the values

Install dependencies:
```
npm i
```
Run the app:
```
npm start
```
or
```
node app.js
```

If you need any more information on how this app works message me. PRs welcome
