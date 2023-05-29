"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mysql_1 = __importDefault(require("mysql"));
dotenv_1.default.config();
const db = mysql_1.default.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
const app = (0, express_1.default)();
const port = process.env.PORT;
app.get('/', (req, res) => {
    const q = 'SELECT * FROM tbl_user';
    db.query(q, (err, data) => {
        if (err)
            return res.json(err);
        return res.json(data);
    });
});
app.listen(port, () => {
    console.log(`Server is up! at http//localhost:${port}`);
});
