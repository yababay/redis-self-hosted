import { Request, Response, Router, NextFunction, json } from 'express';
import { createClient } from 'redis'
import basicAuth from 'express-basic-auth'
import { username, password } from './lib/settings'

const router = Router()
const client = createClient()
const users = {}
Reflect.set(users, username, password)

const unauthorizedResponse = (req: Request) => 'No credentials provided'

const errors = async (err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err)
	res.status(500).send(err.message)
}

router.post('/:key', async (req, res) => {
    const { key } = req.params
    const { subkey } = req.query
    const { body } = req
    client.connect()
    if(typeof subkey === 'string') await client.hSet(key, subkey, `${body}`)
    else if(typeof body === 'string') await client.set(key, body)
    else if(typeof body === 'object') { 
        for(const ownKey of Reflect.ownKeys(body)){
            if(typeof ownKey !== 'string') continue
            await client.hSet(key, ownKey, Reflect.get(body, ownKey))
        }
    }
    else res.status(500).end(`Unsupported content for saving in redis.`)
    client.disconnect()
    res.end()
})

router.get('/:key', async (req, res) => {
    const { key } = req.params
    const { subkey, from, to } = req.query
    client.connect()
    const keyType = await client.type(key)
    if(!await client.exists(key)) res.status(500).end(`The key ${key} is not found`)
    else {
        switch(keyType){
            case 'string':
                res.json(await client.get(key))
                break
            case 'hash':
                res.json(typeof subkey === 'string' ? await client.hGet(key, subkey) : await client.hGetAll(key))
                break
            case 'list':
                if(from && to && !isNaN(+from) && !isNaN(+to)) res.json(await client.lRange(key, +from, +to))
                else {
                    const length = await client.lLen(key)
                    res.json(await client.lRange(key, 0, length))
                }
                break
            case 'set':
                res.json(await client.sMembers(key))
                break
            default:
                res.status(500).end(`Working with ${keyType} in not implemented yet.`)
        }
    }
    client.disconnect()
})

const prepare = [basicAuth({users, unauthorizedResponse}), json({limit: '100k'}), errors]
export { prepare, router }
