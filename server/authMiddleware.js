const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware для проверки JWT-токена
function authenticateToken(req, res, next) {
    // Получаем заголовок Authorization (обычно 'Bearer TOKEN')
    const authHeader = req.headers['authorization'];
    // Извлекаем сам токен (второй элемент массива после 'Bearer')
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // 401: Unauthorized (нет токена)
        return res.status(401).json({ message: 'Требуется токен авторизации.' });
    }

    // Проверяем токен с помощью секретного ключа
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // 403: Forbidden (токен недействителен, просрочен или изменен)
            return res.status(403).json({ message: 'Токен недействителен или просрочен.' });
        }
        
        // Если токен действителен, мы сохраняем данные пользователя (id, email)
        // в объект запроса (req), чтобы они были доступны в следующем обработчике.
        req.user = user;
        
        // Переходим к следующему обработчику маршрута
        next();
    });
}

module.exports = authenticateToken;