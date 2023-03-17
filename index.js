import express from 'express'
import dotenv from 'dotenv'
import router from './router/index.js'

dotenv.config()

const { HTTP_PORT, API_PATH } = process.env

if(!/^\/[\w]/.test(API_PATH)) throw `Bad api path: ${API_PATH}`
if(!/^[\d]+$/.test(HTTP_PORT)) throw `Bad http port: ${HTTP_PORT}`

const app = express()

app.use(API_PATH, router)
app.use((err, req, res, next) => {
    res.status(500).end(err.message)
})

app.listen(HTTP_PORT, () => console.log(`Listening on ${HTTP_PORT}.`))
