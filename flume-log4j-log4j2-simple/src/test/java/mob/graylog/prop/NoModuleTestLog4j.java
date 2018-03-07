package mob.graylog.prop;

import com.lamfire.code.Base64;
import com.lamfire.utils.URLUtils;
import com.lamfire.utils.ZipUtils;
import mob.graylog.TestLog4j;
import org.apache.log4j.Logger;
import org.junit.Test;

import java.net.UnknownHostException;

/**
 * 测试log4j 连接flume ，短链重连、flume宕机、异步不阻塞
 */
public class NoModuleTestLog4j {

    /**
     * @param args
     */

    private static Logger logger = Logger.getLogger(TestLog4j.class);

    @Test
    public void main() throws InterruptedException, UnknownHostException {

        int i = 0;
        while (true) {
            try {
                Thread.sleep(1000);
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
                logger.info("AA");
                logger.debug("BB");
                logger.error(e.getMessage(), e);

                System.out.println("----------log4j--sharesdk---test----------");
            }

        }
    }
}
