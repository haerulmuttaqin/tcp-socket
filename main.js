const net = require('net')
const fs = require('fs')
var os = require("os")
const utils = require('./utils')

let sockets = [];
let clients = []
let configJson = fs.readFileSync('config.json');
let config = JSON.parse(configJson);
const host = config.server_host;
const port = config.server_port;

init()

async function init() {
    await run()
    fs.writeFileSync('log/client_log.txt', `[${utils.getDatetimeNow()}] Server started on port ${clients} at ${host} ${os.EOL}`);
}
function run() {
    config.model_2.forEach((arrCient, i) => {
        arrClientIndex = i
        arrCient.forEach((client, i) => {
            const server = net.createServer(onClientConnection);
            server.listen(client, host, function () {
                clients.push(client)
                // console.log(`Server started on port ${client} at ${host}`);
            });
        })
    })
    console.log(`Server started at ${host}`);
}

function onClientConnection(socket) {
    // console.log(`${socket.remoteAddress}:${socket.remotePort} Connected to port ${socket.localPort}`);
    inputLog(`[${utils.getDatetimeNow()}] ${socket.remoteAddress}:${socket.remotePort} Connected to port ${socket.localPort}`)
    socket.id = socket.localPort;
    sockets.push(socket);
    socket.on('data', function (data) {
        // console.log(`${socket.remoteAddress}:${socket.remotePort} -> : ${data} `);
        if (config.active_model == 2) {
            let arrClientIndex
            config.model_2.forEach((arrCient, i) => {
                arrClientIndex = i
                arrCient.forEach((client, i) => {
                    if (client === socket.id) {
                        config.model_2[arrClientIndex].forEach((clientSelected, i) => {
                            if (sockets.length === 0) return
                            sockets.forEach(function (socketItem, index, array) {
                                // console.log(socketItem.id);
                                if (socketItem.id == socket.localPort) return
                                if (socketItem.id === clientSelected) {
                                    socketItem.write(data);
                                    inputLog(`[${utils.getDatetimeNow()}] Transaction data from ${socket.remoteAddress}:${socket.localPort} to ${socket.remoteAddress}:${clientSelected}`)
                                }
                            });
                        })
                    }
                })
            })
        }
    });

    socket.on('close', function () {
        removeSocket(socket.remotePort)
        console.log(`${socket.remoteAddress}:${socket.remotePort} Terminated the connection`);
    });

    socket.on('error', function (error) {
        console.error(`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}`);
    });
};

function removeSocket(socket) {
    sockets.splice(sockets.indexOf(socket), 1);
};

function inputLog(text) {
    fs.open('log/client_log.txt', 'a', 666, function (e, id) {
        fs.write(id, text + os.EOL, null, 'utf8', function () {
            fs.close(id, function () {});
        });
    });
}

function packetSize(client, data) {
    var args = {};
    args.accumulatingBuffer = new Buffer(0);
    args.totalPacketLen = -1;
    args.accumulatingLen = 0;
    args.recvedThisTimeLen = 0;
    return utils.parseBuffer(client, data, args);
}