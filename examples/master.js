var Master = require("../lib/NodeMaster");

// console.debug = ()=>{}
var masterinfo = {
    host:"127.0.0.1",
    port:9100,
    tport:9200, //转发同步数据的port
}
var master = new Master();
master.start(masterinfo);

