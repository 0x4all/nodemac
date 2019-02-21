var MasterListener = require("../lib/MasterListener");

var masterinfo = {
    host:"127.0.0.1",
    port:9100,
    tport:9200,
}

var listener = new MasterListener({identity:"webserver-1"});
listener.listen(masterinfo);


function show(){
    console.log(listener._nodelist, Math.random());
    setTimeout(show,1000);
}

show();
