var zmq = require("bzeromq");
var ut = require("./utils");

function NodeMaster(){
    this._nodemap = {};
    this._nodelist = [];
}

module.exports = NodeMaster;


NodeMaster.prototype._check_heartbeat = function(envelope){
    this.hearts[envelope] = {state:"pong",time: Date.now()};
    setTimeout(()=>{
        this.hearts[envelope] = {state:"ping",time: Date.now()};
        this.rep.send([envelope,ut.pack({route:"ping"})]);
        setTimeout(()=>{
            var data = this.hearts[envelope];
            var offset = (Date.now() - data.time);
            if(data.state == "ping" && offset>500){
                console.warn(envelope.toString(), " disconnect.", offset);
            }
        },500);
    }, 3000);
}
/**
 * 
 * @param {{host,port}} masterinfo 
 */
NodeMaster.prototype.start = function(masterinfo){
    this.hearts = {};
    this.rep = zmq.socket("router");
    this.rep.monitor(500, 0);
    this.rep.bindSync(ut.get_tcp_url(masterinfo));
    console.info("master started.")
    this.rep.on("message", (envelope, buffer)=>{
        var msg = ut.unpack(buffer);
        console.debug("recv msg:",envelope.fd, envelope.toString(), buffer.fd);
        var data = msg.data;
        if(msg.route == "reg") {
            this._nodemap[data.node_id] = data;
            this._nodelist.push(data);
            console.info("register node:", data);
            this.rep.send([envelope,ut.pack({route:"reg_ok"})]);
            this._check_heartbeat(envelope);
        }
        else if(msg.route == "set"){
            //更新节点信息
            var node = this._nodemap[data.node_id];
            if(node){
                if(data.key) {
                    node[data.key] = data.val;
                }
                else if(data.obj){
                    for(var key in data.obj){
                        node[key] = data.obj[key];
                    }
                }
                console.debug("node update:", node);
            }
            else{
                console.error("node not register:", data.node_id);
            }
        }
        else if(msg.route == "pong"){
            this._check_heartbeat(envelope);
        }
        // this.rep.send(ut.pack({code:"ok"}));
    });

    this.rep.on('close', function(fd, ep) {
        console.debug('close, endpoint:',fd, ep);
    });

    this.rep.on('accept', function(fd, ep, ex) {
        console.debug('accept, endpoint:',fd, ep, ex);
    });

    this.rep.on('disconnect', function(fd, ep, ex) {
        console.debug('disconnect, endpoint:',fd, ep, ex);
    });
}