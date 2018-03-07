package com.example.myapplication.service;

import android.content.Context;
import android.util.Log;
import com.example.myapplication.domain.UpdateInfo;
import com.example.myapplication.util.Io2XmlUtil;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;

/**
 * Created by wangly on 2017/9/11.
 */
public class UpdateInfoService {
    private static final String TAG = "UpdateInfoService";
    private Context context;

    public UpdateInfoService(Context context) {
        this.context = context;
    }

    public UpdateInfo getUpdateInfo(int urlId) throws Exception {
        UpdateInfo info = new UpdateInfo();
        Log.i(TAG, urlId + "");
        // Android 4.0 之后不能在主线程中请求HTTP请求
        String httpUrl = context.getResources().getString(urlId);
        Log.i(TAG, httpUrl);
        URL url = null;
        try {
            url = new URL(httpUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(5000);
            conn.setRequestMethod("GET");
            InputStream io = conn.getInputStream();
            Io2XmlUtil.getUpdateInfo(io, info);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (ProtocolException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }


        return info;
    }
}
