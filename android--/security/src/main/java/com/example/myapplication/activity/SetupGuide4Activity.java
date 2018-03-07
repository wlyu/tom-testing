package com.example.myapplication.activity;

import android.app.Activity;
import android.os.Bundle;
import android.widget.RadioButton;
import android.widget.Toast;
import com.example.myapplication.R;
import com.example.myapplication.base.BaseSetUpActivity;

public class SetupGuide4Activity extends BaseSetUpActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_setup4);
        RadioButton rb2 = findViewById(R.id.rb_4);
        rb2.setChecked(true);
    }

    @Override
    protected void showNext() {
        Toast.makeText(this, "No_LAST...", 0).show();

    }

    @Override
    protected void showPre() {
        startActivityAndFinshSelf(SetupGuide3Activity.class);
    }
}