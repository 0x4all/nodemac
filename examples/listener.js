const {MasterListener} = require("../");

var masterinfo = {
    host:"127.0.0.1",
    port:9100,
    tport:9200,
}

var listener = new MasterListener({node_id:"webserver-1"});
listener.listen(masterinfo);

listener.on("update", (info)=>{
    console.log("update", listener._nodelist, Math.random());
})


listener.on("addnode", (info)=>{
    console.log("addnode",info, Math.random());
})

listener.on("removenode", (info)=>{
    console.log("removenode",info, Math.random());
})


