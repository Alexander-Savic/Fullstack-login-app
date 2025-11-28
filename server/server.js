const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db'); 
const cors = require('cors'); 
const authenticateToken = require('./authMiddleware'); // Импорт middleware

require('dotenv').config();

const app = express();
const PORT = 3000;
const saltRounds = 10;

// --- Middleware (Промежуточное ПО) ---

app.use(cors()); 
app.use(express.json());

// ------------------------------------------
// 1. МАРШРУТ РЕГИСТРАЦИИ (Sign Up)
// ------------------------------------------

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Заполните все поля.' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const queryText = `
            INSERT INTO accounts (username, email, password_hash) -- Изменено здесь
            VALUES ($1, $2, $3)
            RETURNING id, username, email;
        `;
        const values = [username, email, passwordHash];
        
        const result = await db.query(queryText, values);
        
        res.status(201).json({ 
            message: 'Пользователь успешно зарегистрирован!', 
            user: {
                id: result.rows[0].id,
                username: result.rows[0].username,
            }
        });
        
    } catch (err) {
        if (err.code === '23505') { 
            return res.status(409).json({ message: 'Пользователь с таким email или именем уже существует.' });
        }
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ message: 'Ошибка сервера при регистрации.' });
    }
});

// ------------------------------------------
// 2. МАРШРУТ ВХОДА (Login)
// ------------------------------------------

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Введите Email и пароль.' });
    }

    try {
        const userQuery = 'SELECT * FROM accounts WHERE email = $1';
        const result = await db.query(userQuery, [email]);

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Неверный email или пароль.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );

        res.status(200).json({
            message: 'Вход успешен!',
            token: token,
            userId: user.id
        });

    } catch (err) {
        console.error('Ошибка входа:', err);
        res.status(500).json({ message: 'Ошибка сервера при входе.' });
    }
});

// ------------------------------------------
// 3. ЗАЩИЩЕННЫЙ МАРШРУТ (Protected Route)
// ------------------------------------------

// Маршрут, который требует действительный JWT-токен.
// Обратите внимание на authenticateToken перед обработчиком.
app.get('/api/protected', authenticateToken, (req, res) => {
    // Если код доходит сюда, значит токен действителен!
    // req.user содержит данные из токена: id и email.
    res.json({
        message: 'Вы успешно получили доступ к защищенным данным!',
        user: req.user,
        data: `Привет, пользователь ID ${req.user.id}. Это секретные данные!`
    });
});


// ------------------------------------------
// Запуск сервера
// ------------------------------------------
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});