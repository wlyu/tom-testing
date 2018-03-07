package com.example.myapplication.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioButton;
import com.example.myapplication.R;
import com.example.myapplication.base.BaseSetUpActivity;

public class SetupGuide3Activity extends BaseSetUpActivity {

    private EditText editText;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_setup3);
        RadioButton rb2 = findViewById(R.id.rb_3);
        rb2.setChecked(true);

        Button button = findViewById(R.id.btn_bind_sim);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(SetupGuide3Activity.this,
                        ContactSelectActivity.class);
                startActivityForResult(intent,0);
            }
        });


        editText = findViewById(R.id.phone_input);
    }

    @Override
    protected void showNext() {
        startActivityAndFinshSelf(SetupGuide4Activity.class);
    }

    @Override
    protected void showPre() {
        startActivityAndFinshSelf(SetupGuide2Activity.class);

    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if(data!=null){
            String phone= data.getStringExtra("phone");
            editText.setText(phone);
        }
    }
}