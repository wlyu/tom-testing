package com.example.myapplication.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.RadioButton;
import android.widget.Toast;
import com.example.myapplication.R;
import com.example.myapplication.base.BaseSetUpActivity;

public class SetupGuide1Activity extends BaseSetUpActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_setup1);
        RadioButton rb1 = findViewById(R.id.rb_1);
        rb1.setChecked(true);
    }

    @Override
    protected void showNext() {
        startActivityAndFinshSelf(SetupGuide2Activity.class);
    }

    @Override
    protected void showPre() {
        Toast.makeText(this, "No1...", 0).show();
    }


}