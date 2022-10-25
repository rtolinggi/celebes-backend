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
exports.verifiedEmail = exports.signUp = void 0;
const prisma_1 = require("../database/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const email_1 = __importStar(require("../helpers/email"));
const crypto_1 = __importDefault(require("crypto"));
const UserSchema = zod_1.z
    .object({
    email: zod_1.z
        .string({ required_error: "email is required" })
        .email({ message: "invalid email address" }),
    passwordHash: zod_1.z
        .string({ required_error: "password is required" })
        .min(6, { message: "password must be 6 or more characters long " }),
    confirmPassword: zod_1.z.string({
        required_error: "confirm password is required",
    }),
})
    .refine((data) => data.passwordHash === data.confirmPassword, {
    message: "Password not match",
    path: ["confirmPassword"],
});
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = yield req.body;
    let resJson;
    try {
        yield UserSchema.parseAsync(body);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            resJson = {
                code: 400,
                status: "Bad Request",
                data: [],
                errors: error.errors.map((msg) => msg.message),
            };
            return res.status(400).json(resJson);
        }
    }
    const checkUserExist = yield prisma_1.prisma.user.findUnique({
        where: {
            email: body.email,
        },
    });
    if (checkUserExist) {
        resJson = {
            code: 409,
            status: "Conflict",
            data: [],
            errors: ["Email Already Exist"],
        };
        return res.status(409).json(resJson);
    }
    const salt = yield bcryptjs_1.default.genSalt(10);
    body.passwordHash = yield bcryptjs_1.default.hash(body.passwordHash, salt);
    let userCreate;
    let token;
    try {
        token = crypto_1.default.randomBytes(32).toString("hex");
        userCreate = yield prisma_1.prisma.user.create({
            data: {
                email: body.email,
                passwordHash: body.passwordHash,
                VerifiedEmail: {
                    create: {
                        token,
                    },
                },
            },
        });
    }
    catch (error) {
        resJson = {
            code: 500,
            status: "Internal Server Error",
            data: [],
            errors: ["Internal Server Error Please Contact Administrator"],
        };
        return res.status(500).json(resJson);
    }
    (0, email_1.default)(body.email, "Verification User", (0, email_1.bodyEmail)(`http://localhost:3000/auth/verified/${token}`));
    resJson = {
        code: 201,
        status: "Created",
        data: [userCreate],
        errors: [],
    };
    return res.json(resJson);
});
exports.signUp = signUp;
const verifiedEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let resJson;
    const token = req.params.token;
    const idEmail = yield prisma_1.prisma.verifiedEmail.findFirst({ where: { token } });
    if (!idEmail) {
        resJson = {
            code: 404,
            status: "Not Found",
            data: [],
            errors: ["Invalid Token"],
        };
        return res.status(404).json(resJson);
    }
    try {
        yield prisma_1.prisma.user.update({
            where: {
                id: idEmail.userId,
            },
            data: {
                isVerified: true,
            },
        });
    }
    catch (error) {
        resJson = {
            code: 500,
            status: "Internal Server Error",
            data: [],
            errors: ["Something wrong Internal Server Error"],
        };
    }
    resJson = {
        code: 200,
        status: "OK",
        data: [{ message: "Validate User Email is Success" }],
        errors: [],
    };
    res.status(200).json(resJson);
});
exports.verifiedEmail = verifiedEmail;
//# sourceMappingURL=authController.js.map