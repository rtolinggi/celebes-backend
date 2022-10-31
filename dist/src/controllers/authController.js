"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.SignOut = exports.SignUp = exports.SignIn = void 0;
const email_1 = __importStar(require("../helpers/email"));
const user_1 = require("../models/user");
const validate_1 = require("../helpers/validate");
const schema_1 = require("../helpers/schema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = require("jsonwebtoken");
const constant_1 = require("../configs/constant");
const prisma_1 = require("../database/prisma");
const SignIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    let resJson;
    body.confirmPassword = body.passwordHash;
    const validation = yield (0, validate_1.Validate)(schema_1.UserSchema, body);
    if (validation) {
        resJson = {
            code: 400,
            status: "Bad Request",
            data: [],
            errors: validation,
        };
        return res.status(400).json(resJson);
    }
    const { data } = yield (0, user_1.GetUserByEmail)(body.email);
    if (!data[0]) {
        resJson = {
            code: 404,
            status: "Not Found",
            data: [],
            errors: ["Email or Password is correct"],
        };
        return res.status(404).json(resJson);
    }
    if (!data[0].isVerified) {
        resJson = {
            code: 401,
            status: "Unautorized",
            data: [],
            errors: ["Email Not Verified, Please Verified youre email"],
        };
        return res.status(401).json(resJson);
    }
    if (!data[0].isActive) {
        resJson = {
            code: 401,
            status: "Unautorized",
            data: [],
            errors: ["User Not Active, Please contact administrator"],
        };
        return res.status(401).json(resJson);
    }
    const checkPassword = yield bcryptjs_1.default.compare(body.passwordHash, data[0].passwordHash);
    if (!checkPassword) {
        resJson = {
            code: 404,
            status: "Not Found",
            data: [],
            errors: ["Email or Password is correct"],
        };
        return res.status(404).json(resJson);
    }
    const refreshToken = (0, jsonwebtoken_1.sign)({
        id: data[0].id,
        email: data[0].email,
        role: data[0].role,
    }, String(constant_1.JWT_SECRET_REFRESH_TOKEN), {
        expiresIn: "30d",
    });
    const accessToken = (0, jsonwebtoken_1.sign)({
        id: data[0].id,
        email: data[0].email,
        role: data[0].role,
    }, String(constant_1.JWT_SECRET_ACCESS_TOKEN), {
        expiresIn: "1h",
    });
    const newData = yield prisma_1.prisma.user.update({
        where: {
            email: body.email,
        },
        data: {
            refreshToken,
        },
    });
    resJson = {
        code: 200,
        status: "OK",
        data: [
            {
                id: newData.id,
                email: newData.email,
                role: newData.role,
                accessToken,
                refreshToken,
            },
        ],
        errors: [],
    };
    return res
        .cookie("token", refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
        // secure: true,
    })
        .status(200)
        .json(resJson);
});
exports.SignIn = SignIn;
const SignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = yield req.body;
    let resJson;
    const validation = yield (0, validate_1.Validate)(schema_1.UserSchema, body);
    if (validation) {
        resJson = {
            code: 400,
            status: "Bad Request",
            data: [],
            errors: validation,
        };
        return res.status(400).json(resJson);
    }
    const checkUserAlreadyExist = yield (0, user_1.GetUserByEmail)(body.email);
    if (checkUserAlreadyExist.data[0]) {
        resJson = {
            code: 409,
            status: "Conflict",
            data: [],
            errors: ["Email Already Exist"],
        };
        return res.status(409).json(resJson);
    }
    const token = crypto_1.default.randomBytes(32).toString("hex");
    const { data, errors } = yield (0, user_1.CreateUser)(body, token);
    if ((errors === null || errors === void 0 ? void 0 : errors.length) !== 0) {
        resJson = {
            code: 500,
            status: "Internal Server Error",
            data: [],
            errors: ["Error to create data user"],
        };
    }
    (0, email_1.default)(body.email, "Verification User", (0, email_1.bodyEmail)(`http://localhost:3000/auth/verified/${token}`));
    if (data) {
        resJson = {
            code: 201,
            status: "Created",
            data: data,
            errors: [],
        };
        return res.json(resJson);
    }
});
exports.SignUp = SignUp;
const SignOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let resJson;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    if (!token) {
        resJson = {
            code: 401,
            status: "Unautorized",
            data: [],
            errors: ["Token is required, Youre not login"],
        };
        return res.status(401).json(resJson);
    }
    const user = yield prisma_1.prisma.user.findFirst({
        where: {
            refreshToken: token,
        },
    });
    if (!user) {
        resJson = {
            code: 401,
            status: "Unautorized",
            data: [],
            errors: ["Token not valid"],
        };
    }
    try {
        yield prisma_1.prisma.user.update({
            where: {
                id: user === null || user === void 0 ? void 0 : user.id,
            },
            data: {
                refreshToken: "",
            },
        });
        resJson = {
            code: 200,
            status: "OK",
            data: [{ message: "Logout Success" }],
            errors: [],
        };
        return res.clearCookie("token", { path: "/" }).status(200).json(resJson);
    }
    catch (error) {
        resJson = {
            code: 500,
            status: "Internal Server Error",
            data: [],
            errors: ["Something wrong, Logout Failed"],
        };
        return res.status(500).json(resJson);
    }
});
exports.SignOut = SignOut;
//   export const verifiedEmail = async (req: Request, res: Response) => {
//     let resJson: ResponseJson;
//     const token = req.params.token;
//     const idEmail = await prisma.verifiedEmail.findFirst({ where: { token } });
//     if (!idEmail) {
//       resJson = {
//         code: 404,
//         status: "Not Found",
//         data: [],
//         errors: ["Invalid Token"],
//       };
//       return res.status(404).json(resJson);
//     }
//     try {
//       await prisma.user.update({
//         where: {
//           id: idEmail.userId,
//         },
//         data: {
//           isVerified: true,
//         },
//       });
//     } catch (error) {
//       resJson = {
//         code: 500,
//         status: "Internal Server Error",
//         data: [],
//         errors: ["Something wrong Internal Server Error"],
//       };
//     }
//     resJson = {
//       code: 200,
//       status: "OK",
//       data: [{ message: "Validate User Email is Success" }],
//       errors: [],
//     };
//     res.status(200).json(resJson);
//   };
// };
//# sourceMappingURL=authController.js.map