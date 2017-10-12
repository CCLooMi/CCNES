package com.ccnes.conf;

import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.server.ServerEndpointConfig.Configurator;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.ClassUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.web.socket.server.standard.SpringConfigurator;
@Component
@Lazy(false)
public class MySpringConfigurator extends Configurator implements ApplicationContextAware{
	
	private static ApplicationContext APPLICATIONCONTEXT;
	
	private static final String NO_VALUE = ObjectUtils.identityToString(new Object());

	private static final Log logger = LogFactory.getLog(SpringConfigurator.class);

	private static final Map<String, Map<Class<?>, String>> cache =
			new ConcurrentHashMap<String, Map<Class<?>, String>>();


	@SuppressWarnings("unchecked")
	@Override
	public <T> T getEndpointInstance(Class<T> endpointClass) throws InstantiationException {
		if (APPLICATIONCONTEXT == null) {
			String message = "Failed to find the root WebApplicationContext. Was ContextLoaderListener not used?";
			logger.error(message);
			throw new IllegalStateException(message);
		}

		String beanName = ClassUtils.getShortNameAsProperty(endpointClass);
		if (APPLICATIONCONTEXT.containsBean(beanName)) {
			T endpoint = APPLICATIONCONTEXT.getBean(beanName, endpointClass);
			if (logger.isTraceEnabled()) {
				logger.trace("Using @ServerEndpoint singleton " + endpoint);
			}
			return endpoint;
		}

		Component ann = AnnotationUtils.findAnnotation(endpointClass, Component.class);
		if (ann != null && APPLICATIONCONTEXT.containsBean(ann.value())) {
			T endpoint = APPLICATIONCONTEXT.getBean(ann.value(), endpointClass);
			if (logger.isTraceEnabled()) {
				logger.trace("Using @ServerEndpoint singleton " + endpoint);
			}
			return endpoint;
		}

		beanName = getBeanNameByType(endpointClass);
		if (beanName != null) {
			return (T) APPLICATIONCONTEXT.getBean(beanName);
		}

		if (logger.isTraceEnabled()) {
			logger.trace("Creating new @ServerEndpoint instance of type " + endpointClass);
		}
		return APPLICATIONCONTEXT.getAutowireCapableBeanFactory().createBean(endpointClass);
	}

	private String getBeanNameByType(Class<?> endpointClass) {
		String wacId = APPLICATIONCONTEXT.getId();

		Map<Class<?>, String> beanNamesByType = cache.get(wacId);
		if (beanNamesByType == null) {
			beanNamesByType = new ConcurrentHashMap<Class<?>, String>();
			cache.put(wacId, beanNamesByType);
		}

		if (!beanNamesByType.containsKey(endpointClass)) {
			String[] names = APPLICATIONCONTEXT.getBeanNamesForType(endpointClass);
			if (names.length == 1) {
				beanNamesByType.put(endpointClass, names[0]);
			}
			else {
				beanNamesByType.put(endpointClass, NO_VALUE);
				if (names.length > 1) {
					throw new IllegalStateException("Found multiple @ServerEndpoint's of type [" +
							endpointClass.getName() + "]: bean names " + Arrays.asList(names));
				}
			}
		}

		String beanName = beanNamesByType.get(endpointClass);
		return (NO_VALUE.equals(beanName) ? null : beanName);
	}

	@Override
	public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
		APPLICATIONCONTEXT=applicationContext;
	}
}
