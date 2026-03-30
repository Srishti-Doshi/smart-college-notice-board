"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.hashPassword = void 0;
const node_crypto_1 = require("node:crypto");
const node_util_1 = require("node:util");
const scrypt = (0, node_util_1.promisify)(node_crypto_1.scrypt);
const KEY_LENGTH = 64;
const hashPassword = async (password) => {
    const salt = (0, node_crypto_1.randomBytes)(16).toString("hex");
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH));
    return `${salt}:${derivedKey.toString("hex")}`;
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, storedHash) => {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) {
        return false;
    }
    const storedKey = Buffer.from(key, "hex");
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH));
    if (storedKey.length !== derivedKey.length) {
        return false;
    }
    return (0, node_crypto_1.timingSafeEqual)(storedKey, derivedKey);
};
exports.verifyPassword = verifyPassword;
