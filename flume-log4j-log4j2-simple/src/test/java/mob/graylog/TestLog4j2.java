package mob.graylog;

import com.lamfire.code.Base64;
import com.lamfire.utils.URLUtils;
import com.lamfire.utils.ZipUtils;
import org.apache.logging.log4j.LogManager;
import org.junit.Test;

import java.net.UnknownHostException;

/**
 * Created by wangly on 2017/11/27.
 *
 * 测试log4j2 连接flume ，短链重连、flume宕机、异步
 */
public class TestLog4j2 {
    private static final org.apache.logging.log4j.Logger LOGGER_FOR_REGISTER
            = LogManager.getLogger("logger_for_register");
    private static final org.apache.logging.log4j.Logger LOGGER_FOR_LOGIN
            = LogManager.getLogger("logger_for_login");


    @Test
    public void main() throws InterruptedException, UnknownHostException {
        int i = 0;
        while (true) {
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            try {
                String m = "AH4sIAAAAAAAAA83OS27CMBAA0H2vgpTOjD%2BDuywKrUJLRRUkPmJhx3EJCQKUIojlw7e7XqEXeHrbfFXunlAa1oA4pjFyIrJCSOFqLyuJaJwPxnqhKIAjgR5ZsEXixLUCK50ywXOqTsfscI1N5mzX9UlnOpNJAShIlG5NaFLU5auHO7f5rKD940v7dYld26uhW3p%2FKs5RxPfp1c1n53zxtrkMYf28Wg8f5QjC950nvw49bD%2BX87%2BvEaD1v%2F3%2BAAm%2FmF1cAQAA";
                m = URLUtils.decode(m, "utf-8");
                byte[] gzip = Base64.decode(m);
                byte[] source = ZipUtils.ungzip(gzip);
                String text = new String(source, "UTF-8");
            } catch (Exception e) {
                LOGGER_FOR_REGISTER.error("----2017-11-27注册---" + System.currentTimeMillis(), e);
                LOGGER_FOR_LOGIN.error("----2017-11-27登录---" + System.currentTimeMillis(), e);

                System.out.println("----------log4j2-----------");
            }

        }
    }
}
