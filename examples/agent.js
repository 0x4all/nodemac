var Agent = require("../lib/NodeAgent");
var config = require("./config");

var masterinfo = {
    host:"127.0.0.1",
    port:9100
}

var agentinfo = {
    node_id:"server-id-" + Math.floor(Math.random()*1000),
}
var agent = new Agent(agentinfo, config.agentKey + "1");
agent.add_to_master(masterinfo);

//setvalue
var update_agent = function(){
    var n = Math.floor(Math.random() * 100);
    agent.sync_set("room:count", n);
    agent.sync_set("user:count", n * 4);
    agent.sync_set_obj({
        rules:["mj_xlch","mj_anbj"]
    })
    setTimeout(update_agent, 2000);
}
update_agent();