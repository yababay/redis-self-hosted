import express, { Request, Response, NextFunction } from 'express'
import { proxyPort } from './settings'

const app = express()

app.use(express.static('public'))

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err)
	res.status(500).end(err.message)
})

app.listen(proxyPort, () => console.log(`Listening on ${proxyPort}`))

