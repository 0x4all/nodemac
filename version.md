nodemac:Node Master/ Agent / Client

每个机器有1个Agent, 中心节点为Master， Master的广播节点为Client
# Agent
1. Agent请求Master加入当前节点: req
2. Agent可以更新当前节点的数据到 Master管理: req
3. Agent 接受Master的指令操作： rep
4. 维护自身的节点数据信息，在和master断开后重发

# Master
1. 接受Agent的请求加入: rep
2. 接受Agent发布的节点数据: rep
3. 对Agent发出请求指令: req
4. 发布数据给订阅者： pub

# Client
1. 订阅Master的数据，更新本地数据： sub
2. 使用指定的sort_method对node信息进行排序

# TODO
重连问题;

# ver 0.0.1
1. 构建基于zmq的tcp通路

# ver 0.0.2
1. Agent请求Master加入当前节点: dealer
2. 接受Agent的请求加入: router

# ver 0.0.3     
1. Agent可以更新当前节点的数据到 Master管理: dealer
2. Master接受Agent发布的节点数据: router
3. disconnect 不能定位agent，使用heartbeat解决

# ver 0.0.4 (废弃，当前还没有该需求)
1. Master对Agent发出请求指令: req
2. Agent 接受Master的指令操作： rep

# ver 0.0.5 
1. 发布数据给订阅者： 
2. 订阅Master的数据，更新本地数据：
3. agent断线，要从master移除


# ver 0.0.6 <= 
1. 可以使用identity去验证是合法主机
