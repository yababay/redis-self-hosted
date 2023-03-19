import dotenv from 'dotenv'
dotenv.config()

const { BASIC_AUTH } = process.env

if(!BASIC_AUTH) throw 'Authentication is not configures yet.'
const [username, password] = BASIC_AUTH.split(':')
if(!(username && password)) throw 'No username or password.'

export { username, password }
