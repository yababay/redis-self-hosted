import dotenv from 'dotenv'
dotenv.config()

const {
    BASIC_AUTH,
    REDIS_URL
} = process.env

if(!(BASIC_AUTH && REDIS_URL)) throw 'Not configures yet (url, auth).'
const [username, password] = BASIC_AUTH.split(':')
if(!(username && password)) throw 'No username or password.'

export { username, password, REDIS_URL as redisUrl }
