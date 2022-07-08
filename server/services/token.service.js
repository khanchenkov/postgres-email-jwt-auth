const jwt = require('jsonwebtoken');
const db = require('../database/db');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {expiresIn: '30m'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {expiresIn: '30d'});
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
        } catch (e) {
            return null;
        }
    }

    async saveToken(userId, refreshToken) {

        // в бд на 1 пользователя 1 токен
        // при авторизации с другого устройства, на предыдущем устройстве будет лог аут

        // Нужно
        // В нагрузке токена хранить идентификатор пользователя и идентификатор устройства.
        // При получении запроса на обновление, проверять токен на валидность, доставать из него идентификаторы,
        // искать в базе запись для этих идентификаторов и сравнивать полученный из базы токен с токеном от пользователя.

        const tokenData = await db.query("SELECT * FROM tokens WHERE user_id = $1", [userId]);
        if (tokenData.rows[0]) {
            await db.query("UPDATE tokens SET token = $1 WHERE user_id = $2", [refreshToken, userId]);
        }
        const token = await db.query("INSERT INTO tokens (user_id, token) VALUES ($1, $2) RETURNING *", [userId, refreshToken]);
        return token.rows[0].refreshToken;
    }

    async removeToken(refreshToken) {
        const token = await db.query("DELETE FROM tokens WHERE token = $1 RETURNING *", [refreshToken]);
        return token.rows[0].refreshToken;
    }

    async findToken(refreshToken) {
        const token = await db.query("SELECT * FROM tokens WHERE token = $1", [refreshToken]);
        return token.rows[0];
    }
}

module.exports = new TokenService();