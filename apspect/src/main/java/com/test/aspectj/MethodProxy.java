package com.test.aspectj;
 
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;

import java.text.MessageFormat;
import java.util.Arrays;


@Aspect
public class MethodProxy {

    /**
     * Before
     */
    @Pointcut("execution(* com.test.aspectj.*LoginService.delete**(..)) && @annotation(com.test.aspectj.CheckExist)")
    public void testBefore(){}

    @Before("testBefore()")
    public void before(JoinPoint joinPoint) {
        System.out.println("Logging before " + joinPoint.getSignature().getName());
    }

    /**
     * Around
     */
    @Pointcut("execution(* *.*(..)) && @annotation(com.test.aspectj.CheckExist)")
    public void log(){}

    @Around("log()")
    public Object aroundRedisDelete(ProceedingJoinPoint joinPoint)throws Throwable {
        Object proceed;
        try {
        	System.out.println("==========Around1========");
            proceed = joinPoint.proceed();
            System.out.println("==========Around2========");
            //doing
        }catch (Exception e){
            throw e;
        }
        return proceed;
    }

    /**
     * @After
     */
    @Pointcut("execution(* com.test.aspectj.*LoginService.delete**(..)) && @annotation(com.test.aspectj.CheckExist)")
    public void testAfter(){}

    @After("testAfter()")
    public void after(JoinPoint joinPoint) {
        System.out.println("Logging after " + joinPoint.getSignature().getName());
    }
}