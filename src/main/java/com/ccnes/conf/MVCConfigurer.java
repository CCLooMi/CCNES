package com.ccnes.conf;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.DispatcherServlet;

import com.bitsyntax.CCFLib;
import com.bitsyntax.function.BitConvertLib;

import ccte.core.CCTETemplateFactory;
import ccte.spring.springmvc.CCTETemplateFactoryCreator;
import ccte.spring.springmvc.CCTEViewResolver;

@Configuration
public class MVCConfigurer {
	@Autowired
	private DispatcherServlet dispatcherServlet;
	
	private CCTETemplateFactoryCreator tfc=CCTETemplateFactoryCreator.getInstance();
	
	public MVCConfigurer(){
		CCFLib.fromLib.put("I", (o)->{
			return BitConvertLib.bytes2integer((byte[]) o);
		});
		CCFLib.fromLib.put("U8", (o)->{
			return BitConvertLib.bytes2utf8((byte[]) o);
		});

		CCFLib.toLib.put("I", (o,l)->{
			if(l!=null&&l>0){
				return BitConvertLib.integer2bytes(o, l);
			}else{
				return BitConvertLib.integer2bytes(o, 4);
			}
			});
		CCFLib.toLib.put("U8", (o,l)->{
			return BitConvertLib.utf82bytes(o);
		});
	}

	@Bean
	public ServletRegistrationBean apiServlet() {
	    ServletRegistrationBean bean = new ServletRegistrationBean(dispatcherServlet);
	    bean.addUrlMappings("*.xhtml","*.json","*.do");
	    return bean;
	}
	
	@Bean
	public CCTEViewResolver vr(
			@Value("${ccte.suffix}") String suffix){
		return new CCTEViewResolver("",suffix);
	}
	@Bean
	public CCTETemplateFactory tf(
			@Value("${ccte.templateLoadPath}")String templateLoadPath,
			@Value("${ccte.charset}")String charset,
			@Value("${ccte.suffix}")String suffix){
		
		Properties ps=new Properties();
		ps.put("templateLoadPath", templateLoadPath);
		ps.put("charset", charset);
		ps.put("suffix", suffix);
		
		tfc.setInitProperties(ps);
		return tfc.createCCTETemplateFactory();
	}
}
