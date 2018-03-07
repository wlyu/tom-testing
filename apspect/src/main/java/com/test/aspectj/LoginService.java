package com.test.aspectj;
 

public class LoginService {
     
    @CheckExist()
    public String loginByPhone(String phone){
        System.out.println("loginByPhone");
        return "";
    }

    @CheckExist()
    public String deletePhone(String phone){
        System.out.println("deletePhone");
        return "";
    }
}