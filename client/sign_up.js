// Получаем ссылки на форму и поля ввода
const registerForm = document.querySelector('.new_user');

// Получаем поля:
const usernameInput = registerForm.querySelector('input[placeholder="Username"]');
const emailInput = document.getElementById('email');

// Получаем поля пароля по их типу и порядку (так как у них нет ID)
const passwordFields = registerForm.querySelectorAll('input[type="password"]');
const passwordInput = passwordFields[0];
const passwordConfirmInput = passwordFields[1];

// *** Укажите адрес вашего Express-сервера для регистрации ***
const REGISTER_API_URL = 'http://localhost:3000/api/register'; 

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Остановить стандартную отправку формы

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirmation = passwordConfirmInput.value;

    // --- 1. Клиентская валидация ---
    if (!username || !email || !password || !passwordConfirmation) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    if (password !== passwordConfirmation) {
        alert('Пароли не совпадают! Проверьте поле "Password Confirmation".');
        return;
    }

    // 2. Отправка данных на сервер
    try {
        const response = await fetch(REGISTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Отправляем только username, email и password (пароль будет хеширован на сервере)
            body: JSON.stringify({ username, email, password }),
        });

        // 3. Обработка ответа
        if (response.ok) {
            // Регистрация успешна!
            alert('Регистрация прошла успешно! Теперь вы можете войти.');
            // Перенаправить на страницу входа
            window.location.href = 'login.html'; 
        } else {
            // Ошибка 4xx/5xx (например, пользователь с таким email уже существует)
            const errorData = await response.json();
            alert(`Ошибка регистрации: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        // Ошибка сети или CORS
        console.error('Произошла ошибка при выполнении запроса:', error);
        alert('Не удалось подключиться к серверу. Проверьте, запущен ли бэкенд.');
    }
});