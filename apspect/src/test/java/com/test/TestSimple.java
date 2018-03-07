package com.test;

import com.demo.util.RedisUtil;
import org.junit.Test;

/**
 * Created by wangly on 2017/5/10.
 */
public class TestSimple {
    @Test
    public void get(){
       RedisUtil.set("a", "aaa");
        System.out.println(RedisUtil.get("a"));;
    }
}
