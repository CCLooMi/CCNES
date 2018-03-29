package com.ccnes.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class SystemController {
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
}
