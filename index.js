"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redis_1 = require("redis");
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const settings_1 = require("./lib/settings");
const router = (0, express_1.Router)();
const client = (0, redis_1.createClient)();
const users = {};
Reflect.set(users, settings_1.username, settings_1.password);
const unauthorizedResponse = (req) => 'No credentials provided';
const errors = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(err);
    res.status(500).send(err.message);
});
router.post('/:key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { key } = req.params;
    const { subkey } = req.query;
    const { body } = req;
    client.connect();
    if (typeof subkey === 'string')
        yield client.hSet(key, subkey, `${body}`);
    else if (typeof body === 'string')
        yield client.set(key, body);
    else if (typeof body === 'object') {
        for (const ownKey of Reflect.ownKeys(body)) {
            if (typeof ownKey !== 'string')
                continue;
            yield client.hSet(key, ownKey, Reflect.get(body, ownKey));
        }
    }
    else
        res.status(500).end(`Unsupported content for saving in redis.`);
    client.disconnect();
    res.end();
}));
router.get('/:key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { key } = req.params;
    const { subkey, from, to } = req.query;
    client.connect();
    const keyType = yield client.type(key);
    if (!(yield client.exists(key)))
        res.status(500).end(`The key ${key} is not found`);
    else {
        switch (keyType) {
            case 'string':
                res.json(yield client.get(key));
                break;
            case 'hash':
                res.json(typeof subkey === 'string' ? yield client.hGet(key, subkey) : yield client.hGetAll(key));
                break;
            case 'list':
                if (from && to && !isNaN(+from) && !isNaN(+to))
                    res.json(yield client.lRange(key, +from, +to));
                else {
                    const length = yield client.lLen(key);
                    res.json(yield client.lRange(key, 0, length));
                }
                break;
            case 'set':
                res.json(yield client.sMembers(key));
                break;
            default:
                res.status(500).end(`Working with ${keyType} in not implemented yet.`);
        }
    }
    client.disconnect();
}));
exports.default = { prepare: [(0, express_basic_auth_1.default)({ users, unauthorizedResponse }), (0, express_1.json)({ limit: '100k' }), errors], router };
