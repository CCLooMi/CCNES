package com.ccnes.websocket;

import java.nio.ByteBuffer;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
/**带@on*的任何一个方法内部出现异常都会导致session关闭，所以所有方法中最好tryCatch捕获所有异常*/
public abstract class BaseWebSocketServer {

	protected Session session;
	
	//注意子类重写这些方法之后将取不到这些方法上面的注解
	
	@OnOpen
	public void onOpen(Session session){
		this.session=session;
		try{
			this.whenOpen(session);
		}catch (Exception e) {
			this.onError(session, e);
		}
	};
	
	@OnMessage
	public void onTextMessage(String msg){
		try{
			this.receiveTextMessage(msg);
		}catch (Exception e) {
			this.onError(session, e);
		}
	};
	
	@OnMessage
	public void onBinaryMessage(ByteBuffer bb){
		try{
			this.receiveBinaryMessage(bb);
		}catch (Exception e) {
			this.onError(session, e);
		}
	};
	
	@OnClose
	public void onClose(CloseReason closeReason){
		try{
			this.whenClose(closeReason);
		}catch (Exception e) {
			this.onError(session, e);
		}
	};
	
	@OnError
	public void onError(Session session, Throwable error){
		try {
			this.whenError(session, error);
			this.session.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	};
	public abstract void whenOpen(Session session);
	public abstract void whenClose(CloseReason closeReason);
	public abstract void whenError(Session session, Throwable error);
	public abstract void receiveTextMessage(String msg) throws Exception;
	public abstract void receiveBinaryMessage(ByteBuffer bb) throws Exception;
}
