var crypto = require("crypto")
var utils = {};
module.exports = utils;

utils.md5 = function(content) {
    var c = crypto.createHash("md5");
    c.update(content);
    return c.digest('hex');
};

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


utils.findbyid = function(nodelist, node_id){
    var node;
    if(nodelist){
        for(var i = 0,l = nodelist.length; i < l; ++i){
            var n = nodelist[i];
            if(n.node_id == node_id){
                node = n;
                break;
            }
        }
    }
    return node;
 }

 utils.removebyid = function(nodelist, node_id){
    var idx = -1;
    for(var i = 0, l = nodelist.length; i < l; ++i){
        var n  = nodelist[i];
        if(n.node_id == node_id){
            idx = i;
            break;
        }
    }
    if(idx >= 0){
        nodelist.splice(idx, 1);
    }
}