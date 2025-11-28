// URL защищенного маршрута
const BASE_API_URL = 'http://localhost:3000';
const PROTECTED_API_URL = `${BASE_API_URL}/api/protected`;
const authButtonContainer = document.querySelector('.login-register');

// 1. Функция для перенаправления
function setupAuthRedirects() {
    document.getElementById("login").onclick = () => window.location.href = "login.html";
    document.getElementById("signup").onclick = () => window.location.href = "sign_up.html";
}

// 2. Функция для выхода из системы
function handleLogout() {
    localStorage.removeItem('authToken');
    // Перезагружаем страницу для обновления UI
    window.location.reload(); 
}

// 3. Главная функция: Проверка токена и обновление UI
async function checkAuthAndLoadUser() {
    const token = localStorage.getItem('authToken');
    
    // Если токена нет, показываем кнопки Вход/Регистрация
    if (!token) {

        setupAuthRedirects();
        return;
    }

    try {
        // Запрос к защищенному маршруту с токеном
        const response = await fetch(PROTECTED_API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // <--- Отправка токена
            },
        });

        if (response.ok) {
            const result = await response.json();
            // Токен действителен! Пользователь авторизован.
            
            // 4. Обновляем UI: Показываем имя пользователя и кнопку "Выход"
            // Внимание: ваш JWT токен содержит только email и id. 
            // Мы используем email как идентификатор для приветствия.
            const userEmail = result.user.email; 

            authButtonContainer.innerHTML = `
                <div class="flex items-center space-x-4">
                    <span class="text-gray-700 font-semibold">Привет, ${userEmail}</span>
                    <button class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition" id="logout">Log out</button>
                </div>
            `;
            document.getElementById('logout').onclick = handleLogout;

        } else {
            // Токен недействителен (просрочен или подделан)
            console.error('Токен недействителен или просрочен. Удаляем.');
            localStorage.removeItem('authToken');
            window.location.reload(); // Перезагружаем для отображения кнопок входа
        }

    } catch (error) {
        console.error('Ошибка сети или сервера:', error);
        // В случае ошибки сети, просто показываем кнопки входа
        authButtonContainer.innerHTML = `
            <button class="log-in bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition" id="login">Log in</button>
            <button class="sign-up bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" id="signup">Sign up</button> 
        `;
        setupAuthRedirects();
    }
}

// Запускаем проверку при загрузке страницы
document.addEventListener('DOMContentLoaded', checkAuthAndLoadUser);
