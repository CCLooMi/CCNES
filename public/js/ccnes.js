/**
 * Created by chenxianjun on 2017/9/25.
 */
(function(){
    var CCNes=function(option){
        var that=this;
        this.option=option||{};
        this.log=this.option.log||function(){};
        this.bitsyntax=new CCBitsyntax("t:1/I,(t){10:{uid/U8},20:{tuid/U8},30:{key:1/I,keyType:1/I,handle:1/I},40:{data},50:{data}}");
        this.url=this.option.url||"ws://"+window.location.host+"/ccnes";
        this.socket=new CCSocket(this.url,{onopen:function(){
        	that.login();
            that.option.tuid&&
            that.bindHandle(that.option.tuid);
        },onmessage:function(e){
            that.option.onmessage&&
            that.option.onmessage(that.bitsyntax.convertToObject(e.data));
        },log:this.log});
        this.uid=this.socket.id();
    };
    CCNes.prototype={
        login:function(){
            var data=this.bitsyntax
                .convertToIntArray({t:10,uid:this.uid});
            this.socket.send(new Uint8Array(data));
            this.log("login uid:"+this.uid);
        },
        bindHandle:function(tuid){
            var data=this.bitsyntax.
                convertToIntArray({t:20,tuid:tuid});
            this.socket.send(new Uint8Array(data));
            this.log("bind handle to tuid:"+tuid);
        },
        control:function(key,keyType,handle){
            var data=this.bitsyntax
                .convertToIntArray({t:30,key:key,keyType:keyType,handle:handle});
            this.socket.send(new Uint8Array(data));
        },
        video:function(buffer){
            var data=this.bitsyntax
                .convertToIntArray({t:40,data:buffer});
            this.socket.send(new Uint8Array(data));
        },
        audio:function(buffer){
            var data=this.bitsyntax
                .convertToIntArray({t:50,data:buffer});
            this.socket.send(new Uint8Array(data));
        }
    };
    window.CCNes=CCNes;
})();