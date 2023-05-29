"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mysql_1 = __importDefault(require("mysql"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
dotenv_1.default.config();
const db = mysql_1.default.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.post('/login', (req, res) => {
    const { login, password } = req.body;
    // Query the database for login and password match
    const query = `SELECT * FROM users WHERE login = '${login}' AND password = '${password}'`;
    db.query(query, (err, result) => {
        if (err) {
            throw err;
        }
        if (result.length > 0) {
            res.json({ isSuccess: true, data: result[0] });
        }
        else {
            res.json({ isSuccess: false });
        }
    });
});
app.listen(port, () => {
    console.log(`Server is up! at http//localhost:${port}`);
});
