exports.getDatetimeNow = function () {
    var date = new Date();
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}
exports.parseBuffer = function (client, data, accumulatingBuffer, totalPacketLen, accumulatingLen, recvedThisTimeLen) {
    recvedThisTimeLen = Buffer.byteLength(data);
    var tmpBuffer = new Buffer(accumulatingLen + recvedThisTimeLen);
    accumulatingBuffer.copy(tmpBuffer);
    data.copy(tmpBuffer, accumulatingLen); // offset for accumulating
    accumulatingBuffer = tmpBuffer;
    tmpBuffer = null;
    accumulatingLen = accumulatingLen + recvedThisTimeLen;

    if (accumulatingLen < PACKETHEADERLEN) {
        return;
    } else if (accumulatingLen === PACKETHEADERLEN) {
        packetHeaderLen
        return;
    } else {
        //a packet info is available..
        if (totalPacketLen < 0) {
            totalPacketLen = accumulatingBuffer.readUInt32BE(0);
        }
    }
    while (accumulatingLen >= totalPacketLen + PACKETHEADERLEN) {
        var aPacketBufExceptHeader = new Buffer(totalPacketLen); // a whole packet is available...
        accumulatingBuffer.copy(aPacketBufExceptHeader, 0, PACKETHEADERLEN, PACKETHEADERLEN + totalPacketLen);

        ////////////////////////////////////////////////////////////////////
        //process packet data
        var stringData = aPacketBufExceptHeader.toString();
        try {
            var JSONObject = JSON.parse(stringData);
            handler(client, JSONObject);


            var newBufRebuild = new Buffer(accumulatingBuffer.length - (totalPacketLen + PACKETHEADERLEN)); // we can reduce size of allocatin
            accumulatingBuffer.copy(newBufRebuild, 0, totalPacketLen + PACKETHEADERLEN, accumulatingBuffer.length);

            //init      
            accumulatingLen = accumulatingLen - (totalPacketLen + PACKETHEADERLEN); //totalPacketLen+4
            accumulatingBuffer = newBufRebuild;
            newBufRebuild = null;
            totalPacketLen = -1;

            //For a case in which multiple packets are transmitted at once.
            if (accumulatingLen <= PACKETHEADERLEN) {
                //need to get more data -> wait..
                return;
            } else {
                totalPacketLen = accumulatingBuffer.readUInt32BE(0);
            }
        } catch (ex) {
            console.log(ex + ' unable to process data');
            return;
        }
    }
}