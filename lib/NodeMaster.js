var zmq = require("bzeromq");
var ut = require("./utils");

function NodeMaster(){
    this._nodemap = {};
    this._nodelist = [];
}

module.exports = NodeMaster;

/**
 * 
 * @param {{host,port}} masterinfo 
 */
NodeMaster.prototype.start = function(masterinfo){
    this.rep = zmq.socket("rep");
    this.rep.monitor(500, 0);
    this.rep.bindSync(ut.get_tcp_url(masterinfo));
    console.debug("master started.")
    this.rep.on("message", (buffer)=>{
        var msg = ut.unpack(buffer);
        console.debug("recv msg:", msg);
        if(msg.route == "reg") {
            var data = msg.data;
            this._nodemap[data.node_id] = data;
            this._nodelist.push(data);
            console.debug("register node:", data);
        }
        this.rep.send(ut.pack({code:"ok"}));
    });

    this.rep.on('close', function(fd, ep) {
        console.debug('close, endpoint:',fd, ep);
    });

    this.rep.on('accept', function(fd, ep) {
        console.debug('accept, endpoint:',fd, ep);
    });

    this.rep.on('disconnect', function(fd, ep) {
        console.debug('disconnect, endpoint:',fd, ep);
    });
}