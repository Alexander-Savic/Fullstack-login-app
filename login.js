// Получаем ссылки на форму и поля ввода
const loginForm = document.querySelector('.new_user');
const emailInput = document.getElementById('email');
// Получаем поле пароля. В HTML у него не было ID, поэтому используем querySelector.
const passwordInput = loginForm.querySelector('input[type="password"]'); 

// *** Укажите адрес вашего Express-сервера для входа ***
const LOGIN_BASE_API_URL = 'http://localhost:3000/api/login'; 

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвращение стандартной перезагрузки страницы

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert('Пожалуйста, введите Email и пароль.');
        return;
    }

    try {
        // 1. Отправка данных на сервер
        const response = await fetch(LOGIN_BASE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Отправляем данные в формате JSON
            body: JSON.stringify({ email, password }),
        });

        // 2. Обработка ответа
        if (response.ok) {
            const result = await response.json();
            
            // Успешный вход!
            alert('Вход успешен! Добро пожаловать.');
            
            // Сохранение JWT-токена для последующих запросов к защищенным маршрутам
            localStorage.setItem('authToken', result.token); 
            
            // Перенаправление на главную страницу
            window.location.href = 'index.html'; 

        } else {
            // Ошибка (например, неверный пароль, 401 Unauthorized)
            const errorData = await response.json();
            alert(`Ошибка входа: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        // Ошибка сети или CORS
        console.error('Ошибка подключения к серверу:', error);
        alert('Не удалось подключиться к серверу. Проверьте, запущен ли бэкенд на ' + LOGIN_BASE_API_URL);
    }
});