var zmq = require("bzeromq");
var ut = require("./utils");


/**
 * 
 * @param {{node_id}} baseinfo 
 */
function NodeAgent(baseinfo, agentKey){
    this.added_to_master = false;
    this.connected = false;
    this.baseinfo = baseinfo;
    this.identity = ut.md5(agentKey + this.baseinfo.node_id);
    console.info("new agent:", agentKey, this.baseinfo.node_id, this.identity);
    this.settings = {};
}

module.exports = NodeAgent;

// Agent请求Master加入当前节点
/**
 * 
 * @param {{host,port}} master_info 
 */
NodeAgent.prototype.add_to_master = function(master_info){
    this.master_req = zmq.socket("dealer");
    this.master_req.identity = this.identity;
    this.master_req.monitor(500, 0);
    this.master_req.connect(ut.get_tcp_url(master_info));
    this.master_req.on("message",(buff)=>{
        var msg = ut.unpack(buff);
        if(msg.route == "reg_ok"){
            this.added_to_master = true;
            console.debug(this.baseinfo.node_id, "reg to master ok");
            return;
        }
        else if(msg.route == "ping"){
            this.send_to_master({route:"pong"});
        }
    })
    this.master_req.on('close', (fd, ep) => {
        this.connected = false;
        console.debug('close, endpoint:',fd, ep);
    });

    this.master_req.on('connect', (fd, ep)=> {
        console.debug('connect, endpoint:',fd, ep);
        this.connected = true;
        this.master_req.send(ut.pack({route:"reg", data: this.baseinfo }));
    });

    this.master_req.on('disconnect', (fd, ep)=>  {
        console.debug('disconnect, endpoint:',fd, ep);
    });
}


/**
 * 发送数据到master
 * @param {{route, data}} msg 
 */
NodeAgent.prototype.send_to_master = function(msg){
    if(!this.added_to_master){ return;}
    this.master_req.send(ut.pack(msg));
}

NodeAgent.prototype._create_msg = function(route, data){
    data.node_id = this.baseinfo.node_id;
    return {
        route: route,
        data: data
    }
}

/**
 * 设置当前key val并且同步到master
 * @param {*} key 
 * @param {*} val 
 */
NodeAgent.prototype.sync_set = function(key, val){
    this.settings[key] = val;
    var data = {
        key: key,
        val: val
    }
    // var obj = {obj:{key:val}};
    var msg = this._create_msg("set", data);
    this.send_to_master(msg);
}

NodeAgent.prototype.sync_set_obj = function(obj){
    for(var key in obj){
        this.settings[key] = obj[key];
    }
    var data = {obj: obj};
    var msg = this._create_msg("set", data);
    this.send_to_master(msg);
}