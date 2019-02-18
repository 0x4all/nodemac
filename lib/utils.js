var utils = {};
module.exports = utils;


utils.get_tcp_url = function(peerinfo){
    return "tcp://" + peerinfo.host + ":" + peerinfo.port;
}

utils.get_tcp_url_1 = function(host, port){
    return "tcp://" + host + ":" + port;
}

utils.send_to = function(socket, msg){
    socket.send(JSON.stringify(msg));
}

utils.pack = function(msg){
    return JSON.stringify(msg);
}

utils.unpack = function(msg){
    var data = {};
    try{
        data = JSON.parse( msg );
    }catch(e){
        console.log("unpack msg failed", msg);
    }
    return data;
}