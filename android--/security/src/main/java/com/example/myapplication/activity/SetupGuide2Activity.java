package com.example.myapplication.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.RadioButton;
import com.example.myapplication.R;
import com.example.myapplication.base.BaseSetUpActivity;

public class SetupGuide2Activity extends BaseSetUpActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_setup2);
        RadioButton rb2 = findViewById(R.id.rb_2);
        rb2.setChecked(true);

    }

    @Override
    protected void showNext() {
        startActivityAndFinshSelf(SetupGuide3Activity.class);
    }

    @Override
    protected void showPre() {
        startActivityAndFinshSelf(SetupGuide1Activity.class);

    }


}