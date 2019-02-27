var debug = require("debug")("nodemac:listener");
var zmq = require("bzeromq");
var ut = require("./utils");
var util = require("util");
var EventEmitter = require("events").EventEmitter;
/**
 * 监听master的消息，并同步指定的信息
 */

 /**
  * @param {{node_id}} baseinfo
  */
 function MasterListener(baseinfo){
    EventEmitter.call(this);
    this.baseinfo = baseinfo;
    this.identity = ut.md5(baseinfo.node_id);
    this._nodelist = []
 }
 module.exports = MasterListener;

 util.inherits(MasterListener, EventEmitter)

 MasterListener.prototype.getnodelist = function(){
     return this._nodelist;
 }

 MasterListener.prototype.listen = function(masterinfo){
    this.req = zmq.socket("dealer");
    this.req.identity = this.identity;
    this.req.connect(ut.get_tcp_url_1(masterinfo.host, masterinfo.tport));
    this.req.monitor(500,0);
    this.req.on("message", (buffer)=>{
        var msg = ut.unpack(buffer);
        debug("recv:",msg.route);
        var data = msg.data;
        if(msg.route == "nodes") {
            this._nodelist = data;
            debug(this._nodelist);
            this.emit("nodes", this._nodelist);
        }
        else if(msg.route == "reg") {
            var node = ut.findbyid(this._nodelist,data.node_id);
            if(node){
                node = data;
                debug("node reg more times", node);
            }
            else{
                this._nodelist.push(data);
                this.emit("addnode", data);
            }
        }
        else if(msg.route == "unreg") {
            ut.removebyid(this._nodelist,data.node_id);
            this.emit("removenode", data.node_id);
        }
        else if(msg.route == "set") {
            debug(data.node_id);
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
                this.emit("update", data);
                // console.debug("node update:", node);
            }
            else{
                debug("node not register:", data.node_id);
            }
        }
    });

    this.req.on("connect",()=>{
        this.req.send(ut.pack({route:"reg", type:"listener"}));
        debug("current listener connected to master");
    })

 }