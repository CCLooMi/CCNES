package com.ccnes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableAutoConfiguration
@ComponentScan({"com.ccnes.*"})
public class App {
	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}
}
