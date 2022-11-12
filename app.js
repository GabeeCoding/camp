const express = require("express")
const got = require("got")

const app = express()

app.use(express.static("public"));
app.use(require("cookie-parser")())
const url = "http://gabrob.synology.me:"
app.use("/:port", (req, resp) => {
	//get port
	////use port in url to forward requestttti
	console.log(req.originalUrl)
	let port = req.params.port
	let endpoints = req.originalUrl.split("/");
	endpoints.shift();
	endpoints.shift();
	let referrer = req.get("Referrer")
	let parsedPort = parseInt(port)
	let reqUrl	
	if(isNaN(parsedPort)){
		if(referrer != null){
			console.log("parsedPort is NaN, setting port to referrer")
			let split = referrer.split("/")
			split.shift();
			split.shift();
			split.shift();
			console.log(split[0])
			port = split[0]
			let endpointsAlt = req.originalUrl.split("/")
			endpointsAlt.shift();
			reqUrl = url + port + "/" + endpointsAlt.join("/")
		} else {
			//referrer is null
			resp.status(404).end();
			return;
		}
	} else {
		let endpoint = `/${endpoints.join("/")}`
		reqUrl = url + port + endpoint
	}
	got(reqUrl, {
		headers: req.headers,
		method: req.method,
	}).then(response => {
		let ct = response.headers["content-type"]
		if(ct){
			resp.set("Content-Type", ct)
		} else {
			//no content type
			//guess by file name
			if(req.originalUrl.includes(".mp3")){
				resp.set("Content-Type", "audio/mpeg")
			} else if(req.originalUrl.includes(".json")){
				resp.set("Content-Type", "application/json")
			} else {
				resp.status(404).end()
				return;
			}
		}
		resp.send(response.body)
	}).catch(e => console.log(e))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})
