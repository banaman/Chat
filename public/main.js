$(function() {
    const FADE_TIME = 150; // ms
    const TYPING_TIMER_LENGTH = 400; // ms
    const COLORS = [
      '#5199FF', '#00E7F7', '#7367F0', '#FF6A28',
      '#FFC709', '#C0A4FA', '#F464FE', '#0070A5',
      '#780206', '#04CE9B', '#6D107E', '#EFC76C'
    ];
  
    // Переменные
    const $window = $(window);
    const $usernameInput = $('.usernameInput'); // Ввод имя пользователя
    const $messages = $('.messages');           // Сообщение
    const $inputMessage = $('.inputMessage');   // Ввод сообщения
  
    const $loginPage = $('.login.page');        // Страница авторизации
    const $chatPage = $('.chat.page');          // Страница чата
  
    const socket = io();
  
    let username;
    let connected = false;
    let typing = false;
    let lastTypingTime;
    let $currentInput = $usernameInput.focus();

    // Сообщение об участниках
    const addParticipantsMessage = (data) => {
      let message = '';
      if (data.numUsers === 1) {
        message += `Есть 1 участник`;
      } else {
        message += `Есть ${data.numUsers} участников`;
      }
      log(message);
    }
  
    // Установка имени клиента
    const setUsername = () => {
      username = cleanInput($usernameInput.val().trim());
  
      // Если пользователь авторизовался
      if (username) {
        $loginPage.fadeOut();
        $chatPage.show();
        $loginPage.off('click');
        $currentInput = $inputMessage.focus();
  
        // Передать серверу имя пользователя
        socket.emit('add user', username);
      }
    }
  
    // Отправка сообщения в чат
    const sendMessage = () => {
      let message = $inputMessage.val();
      message = cleanInput(message);
      // Если сообщение не пустое и soket подключен
      if (message && connected) {
        $inputMessage.val('');
        addChatMessage({ username, message });
        // Передать серверу 'new message' и отправить сообщение
        socket.emit('new message', message);
      }
    }
  
    // Запись сообщения
    const log = (message, options) => {
      const $el = $('<li>').addClass('log').text(message);
      addMessageElement($el, options);
    }
  
    // Добавление сообщения в чат
    const addChatMessage = (data, options) => {
      // Не скрывает сообщение пока 'X печатает...'
      const $typingMessages = getTypingMessages(data);
      if ($typingMessages.length !== 0) {
        options.fade = false;
        $typingMessages.remove();
      }
  
      const $usernameDiv = $('<span class="username"/>')
        .text(data.username)
        .css('color', getUsernameColor(data.username));
      const $messageBodyDiv = $('<span class="messageBody">')
        .text(data.message);
  
      const typingClass = data.typing ? 'typing' : '';
      const $messageDiv = $('<li class="message"/>')
        .data('username', data.username)
        .addClass(typingClass)
        .append($usernameDiv, $messageBodyDiv);
  
      addMessageElement($messageDiv, options);
    }
  
    // Добавляет в чат что пользователь печатет
    const addChatTyping = (data) => {
      data.typing = true;
      data.message = 'Печатает...';
      addChatMessage(data);
    }
  
    // Удаляет сообщения из чата
    const removeChatTyping = (data) => {
      getTypingMessages(data).fadeOut(function () {
        $(this).remove();
      });
    }

    // Вставка сообщений и прокрутка
    // el - Элемент, который нужно добавить как сообщение
    // options.fade - Если элемент должен исчезнуть (default = true)
    // options.prepend - Если элемент должен быть добавлен
    //   Все остальные сообщения (default = false)
    const addMessageElement = (el, options) => {
      const $el = $(el);
      // Установка опций
      if (!options) {
        options = {};
      }
      if (typeof options.fade === 'undefined') {
        options.fade = true;
      }
      if (typeof options.prepend === 'undefined') {
        options.prepend = false;
      }
  
      // Применение опций
      if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
      }
      if (options.prepend) {
        $messages.prepend($el);
      } else {
        $messages.append($el);
      }
  
      $messages[0].scrollTop = $messages[0].scrollHeight;
    }
  
    // Очищает ввод
    const cleanInput = (input) => {
      return $('<div/>').text(input).html();
    }
  
    // Обнавление уведомления о наборе сообщения
    const updateTyping = () => {
      if (connected) {
        if (!typing) {
          typing = true;
          socket.emit('typing');
        }
        lastTypingTime = (new Date()).getTime();
  
        setTimeout(() => {
          const typingTimer = (new Date()).getTime();
          const timeDiff = typingTimer - lastTypingTime;
          if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            socket.emit('stop typing');
            typing = false;
          }
        }, TYPING_TIMER_LENGTH);
      }
    }
  
    // Получение 'X печатает' от пользователя
    const getTypingMessages = (data) => {
      return $('.typing.message').filter(function (i) {
        return $(this).data('username') === data.username;
      });
    }
  
    // Получение цвета пользоваетля через hash
    const getUsernameColor = (username) => {
      let hash = 7;
      for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash;
      }
      // Расчет цвета
      const index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }
  
    // Event клавиатуры
  
    $window.keydown(event => {
      // Фокусировка на нажатие клавиш
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
      }
      // Когда пользователь нажимает ENTER
      if (event.which === 13) {
        if (username) {
          sendMessage();
          socket.emit('stop typing');
          typing = false;
        } else {
          setUsername();
        }
      }
    });
  
    $inputMessage.on('input', () => {
      updateTyping();
    });
  
    // Event нажатий
  
    // Фокусировка при нажатии в любое место
    $loginPage.click(() => {
      $currentInput.focus();
    });

    $inputMessage.click(() => {
      $inputMessage.focus();
    });
  
    //  Event Socket
  
    // Каждый раз когда сервер расслыает 'login'
    socket.on('login', (data) => {
      connected = true;
      // Собщение приветствия
      const message = 'Добро пожаловать в чат – ';
      log(message, {
        prepend: true
      });
      addParticipantsMessage(data);
    });
  
    // Каждый раз когда сервер расслыает 'new message'
    socket.on('new message', (data) => {
      addChatMessage(data);
    });
  
    // Каждый раз когда сервер расслыает 'user joined'
    socket.on('user joined', (data) => {
      log(`${data.username} подключился`);
      addParticipantsMessage(data);
    });
  
    // Каждый раз когда сервер расслыает 'user left'
    socket.on('user left', (data) => {
      log(`${data.username} покинул чат`);
      addParticipantsMessage(data);
      removeChatTyping(data);
    });
  
    // Каждый раз когда сервер расслыает 'typing'
    socket.on('typing', (data) => {
      addChatTyping(data);
    });
  
    // Каждый раз когда сервер расслыает 'stop typing'
    socket.on('stop typing', (data) => {
      removeChatTyping(data);
    });
  
    socket.on('disconnect', () => {
      log('Вы были отключены');
    });
  
    socket.on('reconnect', () => {
      log('Вы переподключились');
      if (username) {
        socket.emit('add user', username);
      }
    });
  
    socket.on('reconnect_error', () => {
      log('Попытка повторного подключения не удалась');
    });
  
  });