package com.example.myapplication;

import android.content.Context;
import android.support.test.InstrumentationRegistry;
import android.support.test.runner.AndroidJUnit4;

import com.example.myapplication.domain.UpdateInfo;
import com.example.myapplication.util.Io2XmlUtil;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import static org.junit.Assert.*;

/**
 * Instrumentation test, which will execute on an Android device.
 *
 * @see <a href="http://d.android.com/tools/testing">Testing documentation</a>
 */

public class ExampleInstrumentedTest {
    @Test
    public  void man() {
        try {
            System.out.println(Io2XmlUtil.getUpdateInfo(new FileInputStream(new File("C:\\Users\\wangly\\Desktop\\7777\\apache-tomcat-7.0.77\\webapps\\ROOT\\update.xml"))));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
