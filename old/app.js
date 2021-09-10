const net = require('net');
const fs = require('fs')

let sockets = [];
let configJson = fs.readFileSync('config.json');
let config = JSON.parse(configJson);
const host = config.server_host;
const port = config.server_port;

const server = net.createServer(onClientConnection);
server.listen(port, host, function () {
    console.log(`Server started on port ${port} at ${host}`);
});

function onClientConnection(sock) {
    console.log(config);
    sock.id = sock.remotePort;
    sockets.push(sock);
    console.log('ID:' + sock.id + ' added')
    console.log(`${sock.remoteAddress}:${sock.remotePort} Connected`);
    sock.on('data', function (data) {
        console.log(`${sock.remoteAddress}:${sock.remotePort} -> : ${data} `);
        if (config.active_model == 2) {
            let arrClientIndex
            config.model_2.forEach((arrCient, i) => {
                arrClientIndex = i
                arrCient.forEach((client, i) => {
                    if (client === sock.remotePort) {
                        config.model_2[arrClientIndex].forEach((clientSelected, i) => {
                            if (sockets.length === 0) return
                            sockets.forEach(function(socket, index, array){
                                if (socket.id == sock.remotePort) return
                                if(socket.id === clientSelected) {
                                    socket.write(data);
                                }
                            });
                        })
                    }
                })
            })
        }
        
    });

    sock.on('close', function () {
        removeSocket(sock.remotePort)
        console.log(`${sock.remoteAddress}:${sock.remotePort} Terminated the connection`);
    });

    sock.on('error', function (error) {
        console.error(`${sock.remoteAddress}:${sock.remotePort} Connection Error ${error}`);
    });
};

function removeSocket(socket) {
	sockets.splice(sockets.indexOf(socket), 1);
};