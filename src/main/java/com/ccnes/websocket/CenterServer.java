package com.ccnes.websocket;

import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.CloseReason;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import org.springframework.stereotype.Component;

import com.ccnes.protocol.NesProtocol;

//非embed的wen容器使用SpringConfigurator
//@ServerEndpoint(value="/ccnes",configurator=SpringConfigurator.class)
//非embed的web容器不需要使用@component注解
@Component
@ServerEndpoint(value="/ccnes")
public class CenterServer extends BaseWebSocketServer{
	protected static final NesProtocol np=new NesProtocol();
	protected static final Map<String, Session>SESSIONS=new ConcurrentHashMap<>();

	protected Session toSession;
	protected String uid;
	protected String tuid;
	
	@Override
	public void whenOpen(Session session) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void whenClose(CloseReason closeReason) {
		System.out.println("Session closed["+closeReason.getCloseCode()+"]:\t"+closeReason.getReasonPhrase());
		if(uid!=null){
			SESSIONS.remove(uid);
		}
	}

	@Override
	public void whenError(Session session, Throwable error) {
		if(uid!=null){
			SESSIONS.remove(uid);
		}
	}

	@Override
	public void receiveTextMessage(String msg) throws Exception {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void receiveBinaryMessage(ByteBuffer bb) throws Exception {
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
	}
	
}
