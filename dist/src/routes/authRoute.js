"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authRoute = express_1.default.Router();
authRoute.post('/signup', authController_1.SignUp);
authRoute.post('/signin', authController_1.SignIn);
authRoute.delete('/signout', authController_1.SignOut);
authRoute.get('/', authController_1.GetUser);
authRoute.put('/:id', authController_1.UpdateUser);
exports.default = authRoute;
//# sourceMappingURL=authRoute.js.map