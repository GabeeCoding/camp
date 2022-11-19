const express = require("express")
const got = require("got")
const request = require("request")
const fs = require("fs")
require("dotenv").config()
const app = express()
const PORT = process.env.PORT || 3000

const portsToQuery = process.env.PORTLISTS.split(",")
console.log(portsToQuery)

const portBlacklist = process.env.BLACKLIST.split(",")

app.use((req, resp, next) => {
	if(req.originalUrl === "/"){
		resp.clearCookie("port")
	}
	next()
})

app.use(express.static("public"));
app.use(require("cookie-parser")())

const url = process.env.URL

app.get("/campbanner", (req, resp) => {
	if(fs.existsSync("banner.html")){
		let stream = fs.createReadStream("banner.html")
		stream.pipe(resp)
	} else {
		resp.send("")
	}	
})

app.get("/portlist", (req, resp, next) => {
	let list = {}
	portsToQuery.forEach((port) => {
		let x = url + port
		got(x).then(response => {
			let html = response.body
			let start = html.indexOf("<title>")
			let titleAndEnd = html.slice(start + 7)
			let end = titleAndEnd.indexOf("</title>")
			let text = titleAndEnd.slice(0, end)
			list[port] = text
			let length = Object.keys(list).length
			if(length === portsToQuery.length){
				resp.json(list).end()
			}
		}).catch(e => {
			list[port] = "(Unreachable)"
			let length = Object.keys(list).length
			if(length === portsToQuery.length){
				resp.json(list)
			}
		})
	})
})

app.use("/:port", (req, resp) => {
	//get port
	////use port in url to forward requestttti
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
			port = split[0]
			console.log(port, parseInt(port))
			console.log(referrer.includes(":") && !isNaN(parseInt(port)))
			if(referrer.includes(":") && !isNaN(parseInt(port))){
				let endpointsAlt = req.originalUrl.split("/")
				endpointsAlt.shift();
				reqUrl = url + port + "/" + endpointsAlt.join("/")
			} else {
				/*
				//find through regex
				let r = /\d{4}/i;
				let result = r.exec(referrer)
				if(result && !isNaN(parseInt(result[0]))){
				if(false){
					console.log("Port set to ", result[0], " from referer")
					port = result[0]
				} else {
				*/
					let cookie = req.cookies.port
					if(cookie){
						port = cookie
						reqUrl = url + port + req.originalUrl
					} else {
						resp.status(404).end()
						return
					}
				//}
			}
		} else {
			//referrer is null
			resp.status(404).end();
			return;
		}
	} else {
		let endpoint = `/${endpoints.join("/")}`
		reqUrl = url + port + endpoint
	}
	console.log("reqUrl", reqUrl, "port", port, "endpoints", endpoints, "parsedPort", parsedPort, "referer", referrer)
	if(port === ""){
		resp.status(400).end();
		return
	}
	if(port === PORT){
		resp.status(400).end();
		//this shouldnt be a feature anyway
		return
	}
	if(portBlacklist.includes(port.toString())){
		resp.status(403).end();
		return
	}
	//set cookie
	resp.cookie("port", port.toString())
	let x = request({method: req.method, uri: reqUrl})
	x.on("error", (e) => {
		console.log("Request error!")
		console.log(e)

	})
	let reqPipeResult = req.pipe(x)
	reqPipeResult.on("error", (e) => {
		console.log("Pipe error!")
		console.log(e)

	})
	reqPipeResult.pipe(resp)
})

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})
