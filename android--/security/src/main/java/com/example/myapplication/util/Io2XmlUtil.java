package com.example.myapplication.util;

import android.nfc.Tag;
import android.util.Log;
import android.util.Xml;
import com.example.myapplication.domain.UpdateInfo;
import org.xmlpull.v1.XmlPullParser;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

/**
 * Created by wangly on 2017/9/11.
 */
public class Io2XmlUtil {
    private static final String TAG = "Io2XmlUtil";
    public static UpdateInfo getUpdateInfo(InputStream is,final UpdateInfo info) throws Exception
    {
        XmlPullParser xmlPullParser = Xml.newPullParser();
        xmlPullParser.setInput(is, "utf-8");
        int type = xmlPullParser.getEventType();
        while(type != XmlPullParser.END_DOCUMENT)
        {
            switch(type)
            {
                case XmlPullParser.START_TAG :
                    if(xmlPullParser.getName().equals("version"))
                    {
                        info.setVersion(xmlPullParser.nextText());
                    }
                    else if(xmlPullParser.getName().equals("description"))
                    {
                        info.setDescription(xmlPullParser.nextText());
                    }
                    else if(xmlPullParser.getName().equals("apkurl"))
                    {
                        info.setUrl(xmlPullParser.nextText());
                    }
                    break;

                default :
                    break;
            }
            type = xmlPullParser.next();
        }
        Log.i(TAG,info.toString());
        return info;
    }


}
