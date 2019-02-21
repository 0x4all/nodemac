var zmq = require("bzeromq");
var ut = require("./utils");
/**
 * 监听master的消息，并同步指定的信息
 */

 function MasterListener(baseinfo){
    this.baseinfo = baseinfo;
    this._nodelist = []
 }
 module.exports = MasterListener;


 MasterListener.prototype.listen = function(masterinfo){
    this.req = zmq.socket("dealer");
    this.req.identity = this.baseinfo.identity;
    this.req.connect(ut.get_tcp_url_1(masterinfo.host, masterinfo.tport));
    this.req.monitor(500,0);
    this.req.on("message", (buffer)=>{
        var msg = ut.unpack(buffer);
        console.debug("recv:",msg.route);
        var data = msg.data;
        if(msg.route == "nodes") {
            this._nodelist = data;
            console.log(this._nodelist);
        }
        else if(msg.route == "reg") {
            var node = ut.findbyid(this._nodelist,data.node_id);
            if(node){
                node = data;
            }
            else{
                this._nodelist.push(data);
            }
        }
        else if(msg.route == "unreg") {
            ut.removebyid(this._nodelist,data.node_id);
        }
        else if(msg.route == "set") {
            console.log(data.node_id);
            var node = ut.findbyid(this._nodelist,data.node_id);
            if(node){
                if(data.key) {
                    node[data.key] = data.val;
                }
                else if(data.obj){
                    for(var key in data.obj){
                        node[key] = data.obj[key];
                    }
                }
                // console.debug("node update:", node);
            }
            else{
                console.error("node not register:", data.node_id);
            }
        }
    });

    this.req.on("connect",()=>{
        this.req.send(ut.pack({route:"reg", type:"listener"}));
        console.debug("current listener connected to master");
    })

 }