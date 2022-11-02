const express = require("express")
const got = require("got")

const app = express()

const Url = new URL("http://gabrob.synology.me")

app.use(require("cookie-parser")())

app.get("/", (req, resp, next) => {
	let port = req.query.port
	let cookie = req.cookies.port
	console.log(cookie)
	if(!port && !cookie){
		//if there is no port
		//check cookies
		console.log("No port or cookies")
		resp.status(400).end();
	}
	got({
		method: 'get',
		url: "http://gabrob.synology.me:" + req.query.port + req.pathname,
	}).then(response => {
	//	console.log(response)
		resp.send(response.body).end()
	})
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})
