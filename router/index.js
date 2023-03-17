import { createClient } from 'redis'
import { Router } from 'express'

const router = Router()
const client = createClient()

router.get('/:key', async (req, res) => {
    const auth = req.headers.authorization;
    console.log(auth)
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
                res.json(subkey ? await client.hGet(key, subkey) : await client.hGetAll(key))
                break
            case 'list':
                if(from && to && !isNaN(from) && !isNaN(to)) res.json(await client.lRange(key, from, to))
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

export default router
