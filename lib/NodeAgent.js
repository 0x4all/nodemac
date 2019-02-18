var zmq = require("bzeromq");
var ut = require("./utils");


function NodeAgent(baseinfo){
    this.added_to_master = false;
    this.baseinfo = baseinfo;
}

module.exports = NodeAgent;

// Agent请求Master加入当前节点
/**
 * 
 * @param {{host,port}} master_info 
 */
NodeAgent.prototype.add_to_master = function(master_info){
    this.master_req = zmq.socket("req");
    this.master_req.connect(ut.get_tcp_url(master_info));
    this.master_req.on("message",(buff)=>{
        var msg = ut.unpack(buff);
        if(msg.code == "ok"){
            return;
        }
    })
    this.master_req.send(ut.pack({route:"reg",data:this.baseinfo }));
}