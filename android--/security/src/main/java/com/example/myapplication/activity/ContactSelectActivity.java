package com.example.myapplication.activity;

import android.app.Activity;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.View;
import android.view.Window;
import android.widget.AdapterView;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;
import com.example.myapplication.R;
import com.example.myapplication.adapter.ContactAdapter;
import com.example.myapplication.domain.ContactInfo;
import com.example.myapplication.util.ContactInfoParser;

import java.util.List;

/**
 * Created by wangly on 2017/9/14.
 */
public class ContactSelectActivity extends Activity {

    private ListView listView;
    private ContactAdapter contactAdapter;
    private List<ContactInfo> list;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.activity_contact_seelct);
        initView();

    }

    final Handler handler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case 10:
                    if (list != null && list.size() > 0) {
                        contactAdapter = new ContactAdapter(list, ContactSelectActivity.this);
                        listView.setAdapter(contactAdapter);
                    }
                    break;

            }

        }
    };

    private void initView() {
        ((TextView) findViewById(R.id.title)).setText("选择联系人");
        ImageView imageView = findViewById(R.id.imgc_leftbtn);
        imageView.setImageResource(R.drawable.back);
        //
        listView = findViewById(R.id.lv_contact);
        //
        Resources res= ContactSelectActivity.this.getResources();
        Bitmap defaultBitmap = BitmapFactory.decodeResource(res, R.drawable.default_man);
        //
        list = ContactInfoParser.getSysConstact(ContactSelectActivity.this,defaultBitmap);
        handler.sendEmptyMessage(10);

        //list -item事件
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
                ContactInfo info = (ContactInfo) contactAdapter.getItem(i);
                Intent intent = new Intent();
                intent.putExtra("phone", info.getPhone());
                setResult(0, intent);
                finish();
            }
        });
    }
}
