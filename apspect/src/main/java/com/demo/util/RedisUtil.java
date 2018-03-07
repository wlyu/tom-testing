
package com.demo.util;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

import java.util.Properties;
import java.util.ResourceBundle;

public class RedisUtil {

    // Redis服务器IP
    private static String ADDR = "127.0.0.1";

    // Redis的端口号
    private static int PORT = 6379;
    // 可用连接实例的最大数目，默认值为8；
    // 如果赋值为-1，则表示不限制；如果pool已经分配了maxActive个jedis实例，则此时pool的状态为exhausted(耗尽)。
    private static int MAX_ACTIVE = 2000;

    // 控制一个pool最多有多少个状态为idle(空闲的)的jedis实例，默认值也是8。
    private static int MAX_IDLE = 200;

    // 等待可用连接的最大时间，单位毫秒，默认值为-1，表示永不超时。如果超过等待时间，则直接抛出JedisConnectionException；
    private static int MAX_WAIT = 10000;

    private static int TIMEOUT = 10000;// 0是关闭此设置

    // 在borrow一个jedis实例时，是否提前进行validate操作；如果为true，则得到的jedis实例均是可用的；
    private static boolean TEST_ON_BORROW = true;

    private static JedisPool jedisPool = null;


    /**
     * 初始化Redis连接池
     */

    static {

        try {
            Properties props = new Properties();
            props.load(RedisUtil.class.getClassLoader().getResourceAsStream("redis.properties"));
            MAX_ACTIVE = Integer.valueOf(props.getProperty("jedis.pool.maxActive"));
            MAX_IDLE = Integer.valueOf(props.getProperty("jedis.pool.maxIdle"));
            MAX_WAIT = Integer.valueOf(props.getProperty("jedis.pool.maxWait"));
            ADDR = String.valueOf(props.getProperty("jedis.pool.addr"));
            PORT = Integer.valueOf(props.getProperty("jedis.pool.port"));
            TIMEOUT = Integer.valueOf(props.getProperty("jedis.pool.timeOut"));

            JedisPoolConfig config = new JedisPoolConfig();
            config.setMaxTotal(MAX_ACTIVE);
            config.setMaxIdle(MAX_IDLE);
            config.setMaxWaitMillis(MAX_WAIT);
            config.setTestOnBorrow(TEST_ON_BORROW);
            config.setTestOnReturn(TEST_ON_BORROW);
            jedisPool = new JedisPool(config, ADDR, PORT, TIMEOUT);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    /**
     * 获取Jedis实例
     *
     * @return
     */

    public static Jedis getJedis() {
        try {
            if (jedisPool != null) {
                Jedis jedis = jedisPool.getResource();
                //jedisPool.returnBrokenResource(jedis);
                return jedis;
            } else {
                return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 返还到连接池
     *
     * @param jedis
     */

    public static void returnResource(final Jedis jedis) {
        if (jedis != null && jedisPool != null) {
            // jedisPool.returnResource(jedis);
            jedis.close();
        }
    }


    /**
     * 释放jedis资源
     *
     * @param jedis
     */

    public static void returnBrokenResource(final Jedis jedis) {
        if (jedis != null && jedisPool != null) {
            jedisPool.close();
        }
    }


    /**
     * @param key
     * @return String
     * @throws
     * @方法名称:get
     * @内容摘要: ＜直接从从库中获得信息＞
     */

    public static String get(String key) {
        String value = null;
        Jedis jedis = null;
        try {
            jedis = getJedis();
            value = jedis.get(key);
        } catch (Exception e) {
            //释放redis对象
            returnBrokenResource(jedis);
        } finally {
            returnResource(jedis);
        }
        return value;
    }


    /**
     * @param key
     * @param value void
     * @throws
     * @方法名称:set
     * @内容摘要: ＜设置数据>
     */

    public static void set(String key, String value) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            jedis.set(key, value);
        } catch (Exception e) {

            returnResource(jedis);
        } finally {
            returnResource(jedis);
        }
    }


    /**
     * @param key
     * @param time void
     * @throws
     * @方法名称:expire
     * @内容摘要: ＜设置数据有限时间>
     */

    public static void expire(String key, int time) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            jedis.expire(key, time);
        } catch (Exception e) {
            returnResource(jedis);
        } finally {
            returnResource(jedis);
        }
    }

    public static boolean exists(String key) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.exists(key);
        } catch (Exception e) {

            returnResource(jedis);

        } finally {
            returnResource(jedis);
        }
        return false;
    }
}
