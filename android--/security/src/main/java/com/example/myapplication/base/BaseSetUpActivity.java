package com.example.myapplication.base;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.view.Window;
import android.widget.Toast;
import com.example.myapplication.R;

/**
 * Created by wangly on 2017/9/13.
 */
public abstract class BaseSetUpActivity extends Activity {

    public SharedPreferences sp;

    private GestureDetector gd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        sp = getSharedPreferences("config", MODE_PRIVATE);
        //
        gd = new GestureDetector(this, new GestureDetector.SimpleOnGestureListener() {
            @Override
            public boolean onFling(MotionEvent e1, MotionEvent e2,
                                   float velocityX, float velocityY) {

                if (Math.abs(velocityX) < 200) {
                    Toast.makeText(getApplicationContext(), "无效动作，太小", 0).show();
                    return true;
                }
                //→
                if (e2.getRawX() - e1.getRawX() > 200) {

                    showPre();
                    overridePendingTransition(R.anim.pre_in, R.anim.pre_out);
                    return true;
                }
                //←
                if (e1.getRawX() - e2.getRawX() > 200) {
                    showNext();
                    overridePendingTransition(R.anim.next_in, R.anim.next_out);
                    return true;
                }

                return super.onFling(e1, e2, velocityX, velocityY);
            }
        });
    }

    protected abstract void showNext();

    protected abstract void showPre();

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        //分析手势事件
        gd.onTouchEvent(event);
        return super.onTouchEvent(event);
    }

    public void startActivityAndFinshSelf(Class<?> clazz) {
        Intent intent = new Intent(this, clazz);
        startActivity(intent);
        finish();
    }
}
