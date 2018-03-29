package com.ccnes.controller;

import java.io.File;
import java.nio.file.Paths;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class SystemController {
	private String userdir=System.getProperty("user.dir");
	
	@RequestMapping("/index.xhtml")
	public ModelAndView index(){
		return new ModelAndView("index");
	}
	@RequestMapping("/handle/{handle}/{tuid}.xhtml")
	public ModelAndView handle(
			@PathVariable String tuid,
			@PathVariable int handle){
		ModelAndView mv=new ModelAndView("handle");
		mv.addObject("tuid", tuid);
		mv.addObject("handle", handle);
		return mv;
	}
	@RequestMapping("/roms.json")
	@ResponseBody
	public String[] nesRoms(){
		File dir=Paths.get(userdir, "public/nes").toFile();
		return dir.list((f,name)->{
			return name.endsWith(".nes");
		});
	}
}
