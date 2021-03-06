// Базовые установки
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Проброс папки public
app.use(express.static(path.join(__dirname, 'public')));

// Чат

let numUsers = 0;

io.on('connection', (socket) => {
  let addedUser = false;

  // Когда клиент рассылает 'new message'
  socket.on('new message', (data) => {
    // Мы рассылаем клиентам 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // Когда клиент рассылает 'add user'
  socket.on('add user', (username) => {
    if (addedUser) return;

    // Мы сохраняем имя пользователя в сеансе сокета для этого клиента
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // глобальное эхо (все клиенты), когда кто-то подключается
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // Когда клиент отправляет 'typing', передаем всем остальным
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // Когда клиент отправляет 'stop typing', передаём всем остальным
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // Когда пользователь отключается
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // глобальное эхо, что этот клиент покинул чат
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});