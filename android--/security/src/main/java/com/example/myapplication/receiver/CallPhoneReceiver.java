package com.example.myapplication.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.example.myapplication.activity.LostProtectedActivity;

/**
 * Created by wangly on 2017/9/12.
 */
public class CallPhoneReceiver extends BroadcastReceiver {
    private  final static String TAG="CallPhoneReceiver";
    @Override
    public void onReceive(Context context, Intent intent) {
        String data = this.getResultData();
       /* if("1314".equals(data)) {
            Intent intent1 = new Intent(context, LostProtectedActivity.class);
            intent1.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent1);
            setResultData(null);//设置null，拨号键就不会出去
        }*/
        //获取拨打电话的号码
        //在电话号码前加上110，然后返回数据
        setResultData("110"+data);
    }
}
