const express = require('express');
const app = express();

const server = app.listen(3000, function() {
    console.log('server running on port 3001');
});

const io = require('socket.io')(server);

io.on('connection', function(socket) {
    console.log(socket.id);
    socket.on('SEND_MESSAGE', function(data) {
        io.emit('MESSAGE', data)
    });
});

app.use(express.static('./src'));
app.get('*', function(req, res) {
    res.sendFile('njoy/src/index.html', { root: path.join(__dirname, '../')});
});