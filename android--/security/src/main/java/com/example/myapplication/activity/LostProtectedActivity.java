package com.example.myapplication.activity;

import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import com.example.myapplication.R;
import com.example.myapplication.util.MD5Encoder;

/**
 * Created by wangly on 2017/9/12.
 */
public class LostProtectedActivity extends Activity implements View.OnClickListener {
    private SharedPreferences sp;
    private Dialog dialog;
    private EditText password;
    private EditText confirmPassword;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        sp = getSharedPreferences("cofig", Context.MODE_PRIVATE);

        if (isSetPassword()) {
            showLoginDialog();
        } else {
            showFirstDialog();
        }
    }

    private void showFirstDialog() {
        dialog = new Dialog(this, R.style.MyDialog);
        //dialog.setContentView(R.layout.first_dialog);
        View view = View.inflate(this, R.layout.first_dialog, null);
        //这样来填充一个而已文件，比较方便
        password = (EditText) view.findViewById(R.id.et_protected_first_password);
        confirmPassword = (EditText) view.findViewById(R.id.et_protected_confirm_password);
        Button yes = (Button) view.findViewById(R.id.bt_protected_first_yes);
        Button cancel = (Button) view.findViewById(R.id.bt_protected_first_no);
        yes.setOnClickListener(this);
        cancel.setOnClickListener(this);
        dialog.setContentView(view);
        dialog.show();
    }

    private void showLoginDialog() {
        dialog = new Dialog(this, R.style.MyDialog);
        View view = View.inflate(this, R.layout.login_dialog, null);
        password = (EditText) view.findViewById(R.id.et_protected_password);
        Button yes = (Button) view.findViewById(R.id.bt_protected_login_yes);
        Button cancel = (Button) view.findViewById(R.id.bt_protected_login_no);
        yes.setOnClickListener(this);
        cancel.setOnClickListener(this);
        dialog.setContentView(view);
        dialog.show();
    }

    private boolean isSetPassword() {

        String pwd = sp.getString("password", "");
        if (pwd.equals("") || pwd == null) {
            return false;
        }
        return true;
    }

    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.bt_protected_first_yes:
                String fp = password.getText().toString().trim();
                String cp = confirmPassword.getText().toString().trim();
                if (fp.equals("") || cp.equals("")) {
                    Toast.makeText(this, "密码不能为空", Toast.LENGTH_SHORT).show();
                    return;
                } else {
                    if (fp.equals(cp)) {
                        SharedPreferences.Editor editor = sp.edit();
                        editor.putString("password", MD5Encoder.encode(fp));
                        editor.commit();
                    } else {
                        Toast.makeText(this, "两次密码不相同", Toast.LENGTH_SHORT).show();
                        return;
                    }
                }
                dialog.dismiss();
                break;

            case R.id.bt_protected_first_no:
                dialog.dismiss();
                finish();
                break;

            case R.id.bt_protected_login_yes:
                String pwd = password.getText().toString().toString();
                if (pwd.equals("")) {
                    Toast.makeText(this, "请输入密码", Toast.LENGTH_SHORT).show();
                } else {
                    String str = sp.getString("password", "");
                    if (MD5Encoder.encode(pwd).equals(str)) {
                        if (!isSetupGuide()) {
                            finish();
                            Intent intent = new Intent(this, SetupGuide1Activity.class);
                            startActivity(intent);
                        }
                        dialog.dismiss();
                    } else {
                        Toast.makeText(this, "密码错误", Toast.LENGTH_SHORT).show();
                    }
                }
                break;

            case R.id.bt_protected_login_no:
                dialog.dismiss();
                finish();
                break;

            default:
                break;

        }
    }


    private boolean isSetupGuide() {
        return sp.getBoolean("setupGuide", false);
    }

}
