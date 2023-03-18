"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisUrl = exports.password = exports.username = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { BASIC_AUTH, REDIS_URL } = process.env;
exports.redisUrl = REDIS_URL;
if (!(BASIC_AUTH && REDIS_URL))
    throw 'Not configures yet (url, auth).';
const [username, password] = BASIC_AUTH.split(':');
exports.username = username;
exports.password = password;
if (!(username && password))
    throw 'No username or password.';
