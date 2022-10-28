"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET_REFRESH_TOKEN = exports.JWT_SECRET_ACCESS_TOKEN = exports.EMAIL_PASSWORD = exports.EMAIL_USER = exports.EMAIL_VERIFICATION = exports.EMAIL_HOST = exports.PORT = void 0;
const PORT = process.env.PORT;
exports.PORT = PORT;
const EMAIL_VERIFICATION = process.env.EMAIL_VERIFICATION;
exports.EMAIL_VERIFICATION = EMAIL_VERIFICATION;
const EMAIL_HOST = process.env.EMAIL_HOST;
exports.EMAIL_HOST = EMAIL_HOST;
const EMAIL_USER = process.env.EMAIL_USER;
exports.EMAIL_USER = EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
exports.EMAIL_PASSWORD = EMAIL_PASSWORD;
const JWT_SECRET_ACCESS_TOKEN = process.env.JWT_SECRET_ACCESS_TOKEN;
exports.JWT_SECRET_ACCESS_TOKEN = JWT_SECRET_ACCESS_TOKEN;
const JWT_SECRET_REFRESH_TOKEN = process.env.JWT_SECRET_REFRESH_TOKEN;
exports.JWT_SECRET_REFRESH_TOKEN = JWT_SECRET_REFRESH_TOKEN;
//# sourceMappingURL=constant.js.map