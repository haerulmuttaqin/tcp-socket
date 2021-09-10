var net = require('net');

var client = new net.Socket();
var options = {
	hostname: 'example.com',
	port: 8088,
	localAddress : '127.0.0.1',
	localPort: 40001
  };
client.connect(options, () => {
	client.write('Client 1 (40001) Connected');
});

client.on('data', (data) => {
	console.log('Received: ' + data);
});

client.on('close', () => {
	console.log('Connection closed');
});