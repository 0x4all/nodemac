var zmq = require("bzeromq");
var ut = require("./utils");

function NodeMaster(agentKey){
    this._nodelist = [];// Array<node>
    this._clients = {}; //[client]=> node;
    this._listeners = {};
    this.masterinfo = {};
    this.agentKey = agentKey;
}

module.exports = NodeMaster;


NodeMaster.prototype._check_heartbeat = function(client){
    this.hearts[client] = {state:"pong",time: Date.now()};
    setTimeout(()=>{
        this.hearts[client] = {state:"ping",time: Date.now()};
        this.rep.send([client, ut.pack({route:"ping"})]);
        setTimeout(()=>{
            var data = this.hearts[client];
            var offset = (Date.now() - data.time);
            if(data.state == "ping" && offset>500){
                console.warn(client.toString(), " disconnect.", offset);
                this._on_disconnect(client);
            }
        },500);
    }, 3000);
}


NodeMaster.prototype._on_disconnect = function(client){
    delete this.hearts[client];
    var node = this._clients[client];
    if(!node) {
        return;
    }
    var node_id = node.node_id;
    this._publish({route:"unreg", data:{node_id:node_id}});
    delete this._clients[client];
    ut.removebyid(this._nodelist, node_id);
    console.info("node disconnected:", node_id);
}

NodeMaster.prototype._publish = function(info){
    for(var client in this._listeners){
        this.pub.send([client, ut.pack(info)]);
    }
}
/**
 * 
 * @param {{host,port}} masterinfo 
 */
NodeMaster.prototype.start = function(masterinfo){
    this.start_publisher(masterinfo);

    this.hearts = {};
    this.rep = zmq.socket("router");
    this.rep.monitor(500, 0);
    this.rep.bindSync(ut.get_tcp_url(masterinfo));
    console.info("master started.")
    this.rep.on("message", (client, buffer)=>{
        var msg = ut.unpack(buffer);
        console.debug("recv msg:",msg, client.toString(), buffer.fd);
        var data = msg.data;
        if(msg.route == "reg") {
            var validateStr = ut.md5(this.agentKey + data.node_id);
            if( validateStr != client.toString()){
                console.warn("client auth invalid:", data.node_id);
                return;
            }
            this._clients[client] = data;
            ut.removebyid(this._nodelist, data.node_id);
            this._nodelist.push(data);
            console.info("register node:", data);
            this.rep.send([client, ut.pack({route:"reg_ok"})]);
            this._publish(msg);
            this._check_heartbeat(client);
        }
        else if(msg.route == "set"){
            //更新节点信息
            var node = this._clients[client];
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
                this._publish(msg);
            }
            else{
                console.error("node not register:", data.node_id);
            }
        }
        else if(msg.route == "pong"){
            this._check_heartbeat(client);
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

NodeMaster.prototype.start_publisher = function(masterinfo){
    this.pub = zmq.socket("router");
    this.pub.monitor(500, 0);
    this.pub.bindSync(ut.get_tcp_url_1(masterinfo.host, masterinfo.tport));

    this.pub.on("message", (client, buffer)=>{
        var msg = ut.unpack(buffer);
        var data = msg.data;
        console.debug("recv listener:",client.toString(),data);
        if(msg.route == "reg") {
            // data.identity = client;
            if(msg.type == "listener"){
                this._listeners[client] = data;
                //同步全量数据
                this._publish({route:"nodes",data:this._nodelist});
                return;
            }
        }
    });
}