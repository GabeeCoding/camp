const express = require("express")
const got = require("got")
const request = require("request")
require("dotenv").config()
const app = express()
const PORT = process.env.PORT || 3000

const portsToQuery = process.env.PORTLISTS.split(",")
console.log(portsToQuery)

const portBlacklist = process.env.BLACKLIST.split(",")

app.use(express.static("public"));
//app.use(express.json())
//app.use(require("body-parser").json())
const url = process.env.URL

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
	console.log("reqUrl", reqUrl, "port", port, "endpoints", endpoints, "parsedPort", parsedPort, "referer", referrer)
	if(port === ""){
		resp.status(400).end();
		return
	}
	if(port === PORT){
		resp.status(400).end();
		//patch recursion
		//this shouldnt be a feature anyway
		return
	}
	if(portBlacklist.includes(port.toString())){
		resp.status(403).end();
		return
	}
	//rem queries
	/*
	console.log(reqUrl.endsWith("?"))
	if(reqUrl.includes("?")){
		let split = reqUrl.split("?")
		split.pop();
		reqUrl = split.join("")
	}
	*/
	/*
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
	*/
	/*	
	if(req.method !== "GET"){
		let x = request({method: req.method, uri: reqUrl})
		req.pipe(x).pipe(resp)
	} else {
		let stream = got.stream(reqUrl, {throwHttpErrors: true})
		stream.once("error", (e) => console.log(e))
		stream.pipe(resp)
	}
	*/
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
