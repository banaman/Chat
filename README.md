# Chat
Работа по Клиент-серверу.

Основная мысль: создать чат с простым и понятным интерфейсом, который можно с легкостью открыть почти на любом устройстве.

Для реализации проекта использовался Node.js. Node.js – программная платформа, основанная на движке V8, превращающая JavaScript из узкоспециализированного языка в язык общего назначения. Из этого следует, что языки, которые использовались для реализации приложения: HTML, CSS, JS.
Так же были использованы некоторые открытые библиотеки, такие как Socket.IO и jQuery. Socket.IO — JavaScript-библиотека для веб-приложений и обмена данными в реальном времени. jQuery — набор функций JavaScript, фокусирующийся на взаимодействии JavaScript и HTML.

В роли клиента будет выступать любой современный браузер.

У приложения есть две страницы: авторизация и лобби чата. Изначально пользователь попадают на страницу авторизации, где ему предлагается ввести имя, которые будет за ним закреплено на время сессии. После успешного ввода, пользователь попадает в чат, об этом клиент отправляет сообщение серверу о новом клиенте, сервер рассылает всем остальным подключенным клиентам об этом, а самому клиенту выдаётся цвет имени, посчитанный из его хэша. При подключении нового пользователя в чате появляется соответствующее сообщение и сколько клиентов сейчас находятся в чате. Все находятся в одном лобби, нельзя что-то адресовать конкретному пользователю, все видят сообщения в чате 
