/**
 * Created by chenxianjun on 2017/9/24.
 */
(function () {
    var CCSocket = function (url,option) {
        var that=this;
        this.option=option||{};
        this.log=this.option.log||function(){};
        this.uid=getUid();
        this.url=url;
        this.createWs=function(){
            var ws=new WebSocket(that.url);
            //将 WebSocket 对象的 binaryType属性设为“arraybuffer”。默认格式为“blob”;
            ws.binaryType="arraybuffer";
            ws.onopen=onopen;
            ws.onmessage=onmessage;
            ws.onerror=onerror;
            ws.onclose=onclose;
            return ws;
        }
        this.ws=this.createWs();
        this.wait=false;
        function getUid() {
            var uid = localStorage.getItem("uid");
            if (!uid) {
                uid = randomString();
                localStorage.setItem("uid", uid);
            }
            return uid;
        }

        function randomString() {
            return Math
                .random()
                .toString(32)
                .replace(/^[^.]+\./, '');
        }
        function onopen(){
        	that.wait=false;
            that.log("socket opened");
            that.option.onopen&&that.option.onopen();
        }
        function onmessage(e){
            that.option.onmessage&&that.option.onmessage(e);
        }
        function onerror(e){
            that.option.onerror&&that.option.onerror(e);
            that.log("socket error:"+JSON.stringify(e));
        }
        function onclose(e){
            that.option.onclose&&that.option.onclose(e);
            that.log("socket closed:"+JSON.stringify(e));
        }
    }
    CCSocket.prototype = {
        id:function(){
            return this.uid;
        },
        send:function(data){
            if(this.ws.readyState==1){
                this.ws.send(data);
            }else if(this.ws.readyState==3&&!this.wait){
            	this.wait=true;
            	this.reConnectSocket();
            	setTimeout(function(){
            		this.wait=false;
            	},1000);
            }
        },
        reConnectSocket:function(){
            this.ws=this.createWs();
            this.log("socket reconnected");
        }
    };
    window.CCSocket = CCSocket;
})();