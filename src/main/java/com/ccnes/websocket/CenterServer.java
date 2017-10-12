package com.ccnes.websocket;

import javax.websocket.server.ServerEndpoint;

import org.springframework.stereotype.Component;

//非embed的wen容器使用SpringConfigurator
//@ServerEndpoint(value="/ccnes",configurator=SpringConfigurator.class)
//非embed的web容器不需要使用@component注解
@Component
@ServerEndpoint(value="/ccnes")
public class CenterServer extends BaseWebSocketServer{
	
}
