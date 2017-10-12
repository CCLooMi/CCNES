package com.ccnes.conf;

import java.io.IOException;

import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

@Configuration
public class PropertiesConfigurer {
	
	@Bean("propertyConfigurer")
	public static PropertyPlaceholderConfigurer pc() throws IOException{
		PropertyPlaceholderConfigurer pc=new PropertyPlaceholderConfigurer();
		ResourcePatternResolver resourceResolver=new PathMatchingResourcePatternResolver();
		pc.setLocations(resourceResolver.getResources("classpath:properties/*.properties"));
		return pc;
	}
}
