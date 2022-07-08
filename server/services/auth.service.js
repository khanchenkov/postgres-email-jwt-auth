require('dotenv').config();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const db = require('../database/db');
const mailService = require('./mail.service');
const tokenService = require('./token.service');
const ApiError = require('../exceptions/api.error');

class AuthService {
    async registration(name, email, password) {
        const isEmailUsed = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (isEmailUsed.rows[0]) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const link = uuid.v4();
        const user = await db.query(
            "INSERT INTO users (name, email, password, link) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashPassword, link]
        );
        const userId = user.rows[0].id;
        const activated = user.rows[0].activated;

        await mailService.sendActivationMail(email, `${process.env.LOCAL_API_URL}/api/auth/activate/${link}`);
        const tokens = tokenService.generateTokens({userId, name, activated});
        await tokenService.saveToken(userId, tokens.refreshToken);

        return {...tokens, user: {userId, email, activated}}
    }

    async activate(link) {
        const user = await db.query("SELECT * FROM users WHERE link = $1", [link]);
        const userData = user.rows[0];

        if (!userData) {
            throw ApiError.BadRequest('Некорректная ссылка активации');
        }

        await db.query("UPDATE users SET activated = true WHERE id = $1", [userData.id]);
    }

    async login(email, password) {
        const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (!user.rows[0]) {
            throw ApiError.BadRequest('Пароль или email введены неправильно');
        }
        const userPassword = user.rows[0].password;
        const userId = user.rows[0].id;
        const activated = user.rows[0].activated;
        const name = user.rows[0].name;
        const isPassCorrect = await bcrypt.compare(password, userPassword);

        if (!isPassCorrect) {
            throw ApiError.BadRequest('Пароль или email введены неправильно');
        }

        const tokens = tokenService.generateTokens({userId, name, activated});
        await tokenService.saveToken(userId, tokens.refreshToken);

        return {...tokens, user: {userId, email, activated}}
    }

    async logout(refreshToken) {
        return await tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenData = await tokenService.findToken(refreshToken);
        const token = tokenData.token;
        const tokenUserId = tokenData.user_id;

        if (!userData || !token) {
            throw ApiError.UnauthorizedError();
        }

        const user = await db.query("SELECT * FROM users WHERE id = $1", [tokenUserId])

        const userId = user.rows[0].id;
        const name = user.rows[0].name;
        const email= user.rows[0].email;
        const activated = user.rows[0].activated;

        const tokens = tokenService.generateTokens({userId, name, activated});
        await tokenService.saveToken(userId, tokens.refreshToken);

        return {...tokens, user: {userId, email, activated}}
    }
}

module.exports = new AuthService();