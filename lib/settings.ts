import dotenv from 'dotenv'
dotenv.config()

const {
    PROXY_PORT,
} = process.env

function getProxyPort(){
    const usual = 3000
    if(typeof PROXY_PORT !== 'string') return usual
    const port = parseInt(PROXY_PORT)
    return isNaN(port) || port < 1024 ? usual : port
}

export const proxyPort = getProxyPort()

