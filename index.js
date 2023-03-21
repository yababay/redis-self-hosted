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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _RedisApi_router, _RedisApi_middleware;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicApi = exports.RedisApi = void 0;
const express_1 = require("express");
const redis_1 = require("redis");
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const settings_1 = require("./lib/settings");
const client = (0, redis_1.createClient)();
class RedisApi {
    constructor(middleware = null) {
        _RedisApi_router.set(this, (0, express_1.Router)());
        _RedisApi_middleware.set(this, null);
        __classPrivateFieldSet(this, _RedisApi_middleware, middleware, "f");
    }
    get redis() { return client; }
    get router() { return __classPrivateFieldGet(this, _RedisApi_router, "f"); }
    get middleware() { return __classPrivateFieldGet(this, _RedisApi_middleware, "f"); }
    setup(app, path, processErrors = false) {
        const { middleware: mw } = this;
        if (mw === null)
            app.use(path, middleware, this.router);
        else
            app.use(path, middleware, mw, this.router);
        if (processErrors)
            app.use(errors);
    }
}
exports.RedisApi = RedisApi;
_RedisApi_router = new WeakMap(), _RedisApi_middleware = new WeakMap();
class BasicApi extends RedisApi {
    constructor() {
        super();
        const { router, redis: client } = this;
        router.post('/:key', (req, res) => __awaiter(this, void 0, void 0, function* () {
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
        router.get('/:key', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { key } = req.params;
            client.connect();
            if (!(yield client.exists(key)))
                res.status(500).end(`The key ${key} is not found`);
            else {
                const keyType = yield client.type(key);
                const { subkey, from, to } = req.query;
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
    }
}
exports.BasicApi = BasicApi;
const users = {};
Reflect.set(users, settings_1.username, settings_1.password);
const unauthorizedResponse = (req) => 'No credentials provided';
const middleware = [(0, express_basic_auth_1.default)({ users, unauthorizedResponse }), (0, express_1.json)({ limit: '10kb', strict: false })];
const errors = (err, req, res, next) => {
    const { message } = err;
    console.error(message);
    res.status(500).end(message);
};
