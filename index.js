import https from 'https'
import express from 'express'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import router from './router/index.js'
import basicAuth from 'express-basic-auth'

dotenv.config()

const { HTTP_PORT, API_PATH, BASIC_AUTH } = process.env
const [username, password] = (BASIC_AUTH || '').split(':')

if(!/^\/[\w]/.test(API_PATH))  throw `Bad api path: ${API_PATH}`
if(!/^[\d]+$/.test(HTTP_PORT)) throw `Bad http port: ${HTTP_PORT}`
if(!(username && password))    throw `Basic auth is not set up.`

const app = express()
const unauthorizedResponse = req => 'No credentials provided'
const users = {}
users[username] = password

app.use(API_PATH, basicAuth({users, unauthorizedResponse}), router)
app.use((err, req, res, next) => {
    res.status(500).end(err.message)
})

https.createServer({
	key: readFileSync('./assets/domain.key'),
	cert: readFileSync('./assets/domain.crt')
}, app).listen(HTTP_PORT, () => {
  console.log(`Listening ${HTTP_PORT}...`)
});

//app.listen(HTTP_PORT, () => console.log(`Listening on ${HTTP_PORT}.`))

