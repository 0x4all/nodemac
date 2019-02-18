var Agent = require("../lib/NodeAgent");

var masterinfo = {
    host:"127.0.0.1",
    port:9100
}

var agentinfo = {
    node_id:"server-id-" + Math.floor(Math.random()*1000),
}
var agent = new Agent(agentinfo);
agent.add_to_master(masterinfo);

