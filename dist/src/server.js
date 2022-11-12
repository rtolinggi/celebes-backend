"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const constant_1 = require("./configs/constant");
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const accountRoute_1 = __importDefault(require("./routes/accountRoute"));
const whiteList = ['http://localhost:3000'];
const corsOptions = {
    origin(requestOrigin, callback) {
        if (whiteList.indexOf(String(requestOrigin)) !== -1 || !requestOrigin) {
            callback(null, true);
        }
        else {
            callback(new Error('Not Allowed By Cors'));
        }
    },
    credentials: true,
    exposedHeaders: ['token'],
};
const port = constant_1.PORT || 3000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use('/api/auth', authRoute_1.default);
app.use('/api/account', accountRoute_1.default);
app.listen(port, () => {
    console.log(`server running on port : ${port}`);
});
//# sourceMappingURL=server.js.map