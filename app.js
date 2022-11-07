const express = require("express")
const got = require("got")

const app = express()

app.use(require("cookie-parser")())
const url = "http://gabrob.synology.me:"
app.use("/:port", (req, resp) => {
	//get port
	////use port in url to forward requestttt
	let port = req.params.port
	let endpoints = req.originalUrl.split("/");
	endpoints.shift();
	endpoints.shift();
	console.log(port)
	let endpoint = `/${endpoints.join("/")}`
	let reqUrl = url + port + endpoint
	got(reqUrl, {
		headers: req.headers,
		method: req.method,
	}).then(response => {
		resp.send(response.body)
	}).catch(e => console.log(e))
})

const PORT = process.env.PORT || 2000
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})
