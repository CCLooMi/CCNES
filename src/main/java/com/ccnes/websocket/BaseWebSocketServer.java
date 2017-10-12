package com.ccnes.websocket;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;

import com.ccnes.protocol.NesProtocol;
/**带@on*的任何一个方法内部出现异常都会导致session关闭，所以所有方法中最好tryCatch捕获所有异常*/
public abstract class BaseWebSocketServer {

	protected static final NesProtocol np=new NesProtocol();
	protected static final Map<String, Session>SESSIONS=new ConcurrentHashMap<>();
	
	protected Session session;
	protected Session toSession;
	protected String uid;
	protected String tuid;
	
	//注意子类重写这些方法之后将取不到这些方法上面的注解
	
	@OnOpen
	public void onOpen(Session session){
		this.session=session;
	};
	
	@OnMessage
	public void onTextMessage(String msg){
		System.out.println("Got Text Message\t"+msg);
	};
	
	@OnMessage
	public void onBinaryMessage(ByteBuffer bb){
		try{
			byte[]bs=bb.array();
			Map<String, Object>m;
			switch (bs[0]) {
			case 10://login
				m=np.converMsgToMap(bs);
				this.uid=(String) m.get("uid");
				if(uid!=null){
					SESSIONS.put(uid, session);
					System.out.println("uid:\t["+uid+"] login successed.");
				}
				break;
			case 20://bindHandle
				m=np.converMsgToMap(bs);
				this.tuid=(String)m.get("tuid");
				if(this.tuid!=null){
					this.toSession=SESSIONS.get(tuid);
					System.out.println("handle:\t["+uid+"] bind to ["+tuid+"] successed.");
				}
				break;
			default:
				if(toSession!=null&&toSession.isOpen()){
					//不使用异步方式，容易出现数据还在发送另一个又来了，导致出现异常
					toSession.getBasicRemote().sendBinary(bb);
				}else if(tuid!=null){
					toSession=SESSIONS.get(tuid);
				}
				break;
			}
		}catch (Exception e) {
			e.printStackTrace();
		}
	};
	
	@OnClose
	public void onClose(CloseReason closeReason){
		System.out.println("Session closed["+closeReason.getCloseCode()+"]:\t"+closeReason.getReasonPhrase());
		if(uid!=null){
			SESSIONS.remove(uid);
		}
	};
	
	@OnError
	public void onError(Session session, Throwable error){
		if(uid!=null){
			SESSIONS.remove(uid);
		}
		try {
			this.session.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	};
}
