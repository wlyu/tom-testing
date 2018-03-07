package com.example.myapplication.activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.*;
import android.support.v4.content.FileProvider;
import android.util.Log;
import android.view.Window;
import android.view.WindowManager;
import android.view.animation.AlphaAnimation;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import com.example.myapplication.R;
import com.example.myapplication.domain.UpdateInfo;
import com.example.myapplication.service.UpdateInfoService;
import com.example.myapplication.task.DownloadTask;

import java.io.File;

/**
 * Created by wangly on 2017/9/11.
 */
public class SplashActivity extends Activity {
    private final String TAG = "SplashActivity";
    private TextView versionView;
    private LinearLayout ll;
    private UpdateInfo info;

    private Context context;

    //3
    private ProgressDialog progressDialog;
    private String version;

    //5
    private AlertDialog dialog;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //设置不显示title
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.splash);
        //full screen
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        //
        versionView = findViewById(R.id.tv_splash_version);
        version = getVersion();
        versionView.setText("版本号  " + version);

        //旋转
        ll = findViewById(R.id.ll_splash_main);
        AlphaAnimation alphaAnimation = new AlphaAnimation(0.3f, 1.0f);
        alphaAnimation.setDuration(5);
        ll.startAnimation(alphaAnimation);
        context = this;
        new Thread(new CheckVersionTask()).start();

    }
    private static final int APK_ERROR = -2;
    private static final int ERROR = -1;
    private static final int SUCCESS = 0;

    private Handler handler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case APK_ERROR:
                    Toast.makeText(getApplicationContext(),
                            "APK_ERROR", 1).show();
                    break;
                case ERROR:
                    Toast.makeText(getApplicationContext(),
                            "error", 1).show();
                    break;
                case SUCCESS:
                    //是否需要-版本更新
                    if (version.equals(info.getVersion())) {
                        Toast.makeText(getApplicationContext(),
                                "版本相同不需升级", 1).show();
                        loadMainUI();
                    } else {
                        showUpdateDialog();
                    }
                    break;
            }
        }
    };

    class CheckVersionTask implements Runnable {



        @Override
        public void run() {
            UpdateInfoService updateInfoService = new UpdateInfoService(context);
            try {
                info = updateInfoService.getUpdateInfo(R.string.serverUrl);
            } catch (Exception e) {
                Log.i(TAG, "updateInfoService.getUpdateInfo===" + e.getMessage());
            }

            Message message = Message.obtain();
            //通知==handler
            if (info != null && info.getVersion() != null) {
                message.what = SUCCESS;
            } else {
                message.what = ERROR;
            }
            handler.sendMessage(message);
        }
    }


    private void showUpdateDialog() {
        AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);
        alertDialogBuilder.setIcon(android.R.drawable.ic_dialog_info);
        alertDialogBuilder.setTitle("upgrade!!!");
        alertDialogBuilder.setMessage(info.getDescription());
/*
        alertDialogBuilder.setCancelable(false);
*/
        //下载进度条
        progressDialog = new ProgressDialog(SplashActivity.this);
        progressDialog.setIcon(R.drawable.ic_launcher);
        progressDialog.setTitle("带进度条的Ｄialog");
        progressDialog.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
        progressDialog.setMessage("正在下载...");

        alertDialogBuilder.setPositiveButton("ok", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                dialog.dismiss();
                //判断SDcard是否存在并且可读写
                if (Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)) {
                    String defalutPath = getExternalFilesDir(null).toString();
                    Log.i(TAG, "dir=["+defalutPath+"]");

//                    4.4之后，不能随便在sd卡上面创建文件或者文件夹了，
//                    只能在Android/data/你的包名/，
//                    这个路径下创建或者修改，当然，Android/data/你的包名/，这个路径你也是创建不了的，
//                    调用下this.getExternalFilesDir(null)系统会默认给你创建，
//                    然后就可以在Android/data/你的包名/下作读写操作了。
                    String apkPath = defalutPath + "/security/update/new.apk";
                    UpdateTask task = new UpdateTask(info.getUrl(), apkPath);
                    progressDialog.show();
                    Log.i(TAG, "Thread(task).start()");
                    new Thread(task).start();
                } else {
                    Toast.makeText(SplashActivity.this, "SD卡不可用，请插入SD卡", Toast.LENGTH_SHORT).show();
                    loadMainUI();
                    Log.i(TAG, " loadMainUI()");
                }


            }
        });
        alertDialogBuilder.setNegativeButton("cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                loadMainUI();
            }
        });
        dialog = alertDialogBuilder.create();
        dialog .show();
    }

    private String getVersion() {

        PackageManager pm = getPackageManager();
        try {
            PackageInfo pInfo = pm.getPackageInfo(getPackageName(), 0);
            return pInfo.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            Log.i(TAG, "getVersion===" + e.getMessage());
        }
        return "no-version";
    }

    class UpdateTask implements Runnable {
        private String path;
        private String filePath;

        public UpdateTask(String path, String filePath) {
            this.path = path;
            this.filePath = filePath;
        }

        @Override
        public void run() {
            try {
                File file = DownloadTask.getFile(path, filePath, progressDialog);
                progressDialog.dismiss();
                if(file == null){
                    Message message = Message.obtain();
                    message.what = APK_ERROR;
                    handler.sendMessage(message);
                }else{
                    install(context,file);
                }
            } catch (Exception e) {
                e.printStackTrace();
                progressDialog.dismiss();
                Toast.makeText(SplashActivity.this, "更新失败", Toast.LENGTH_SHORT).show();
                loadMainUI();
            }
        }

    }

    /**
     * 安装apk
     *
     * @param file 要安装的apk的目录
     */
    private void install(Context context,File file) {

        Intent intent = new Intent();
        intent.setAction(Intent.ACTION_VIEW);
        intent.addCategory(Intent.CATEGORY_DEFAULT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Uri contentUri = FileProvider.getUriForFile(context,
                    "com.example.myapplication.fileprovider",file);
            intent.setDataAndType(contentUri, "application/vnd.android.package-archive");
        } else {
            intent.setDataAndType(Uri.fromFile(file), "application/vnd.android.package-archive");
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        }

        finish();
        startActivity(intent);
    }

    private void loadMainUI() {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        finish();
    }


}
