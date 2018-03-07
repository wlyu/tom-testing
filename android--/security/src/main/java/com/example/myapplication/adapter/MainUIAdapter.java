package com.example.myapplication.adapter;

import android.content.Context;
import android.content.SharedPreferences;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.TextView;
import com.example.myapplication.R;


public class MainUIAdapter extends BaseAdapter {
    private static final String[] NAMES = new String[]{"手机防盗", "通讯卫士", "软件管理", "流量管理", "任务管理", "手机杀毒",
            "系统优化", "高级工具", "设置中心"};

    private static final int[] ICONS = new int[]{R.drawable.widget01, R.drawable.widget02, R.drawable.widget03,
            R.drawable.widget04, R.drawable.widget05, R.drawable.widget06, R.drawable.widget07,
            R.drawable.widget08, R.drawable.widget09};

    //声明成静态，起到一定的优化作用，关于adapter还有别的优化方法的，有机会我们再说
    private static ImageView imageView;
    private static TextView textView;

    private Context context;
    private LayoutInflater inflater;
    private SharedPreferences sp;

    public MainUIAdapter(Context context) {
        this.context = context;
        inflater = LayoutInflater.from(this.context);
        sp = context.getSharedPreferences("config", Context.MODE_PRIVATE);
    }

    @Override
    public int getCount() {
        return NAMES.length;
    }

    @Override
    public Object getItem(int position) {
        return position;
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        MainViews mainViews ;
        View view;

        if(convertView == null ){

            view = inflater.inflate(R.layout.main_item, null);
            //数据
            mainViews = new MainViews();
            mainViews.imageView = (ImageView) view.findViewById(R.id.iv_main_icon);
            mainViews.textView = (TextView) view.findViewById(R.id.tv_main_name);
            mainViews.imageView.setImageResource(ICONS[position]);
            mainViews.textView.setText(NAMES[position]);
            //tag
            view.setTag(mainViews);

        }else{
            view = convertView;
            //数据
            mainViews = (MainViews)convertView.getTag();
            mainViews.imageView = (ImageView) view.findViewById(R.id.iv_main_icon);
            mainViews.textView = (TextView) view.findViewById(R.id.tv_main_name);
            mainViews.imageView.setImageResource(ICONS[position]);
            mainViews.textView.setText(NAMES[position]);
        }

        if (position == 0) {
            String name = sp.getString("lostName", "");
            if (!name.equals("")) {
                textView.setText(name);
            }
        }

        return view;
    }
    //一个存放所有要绘制的控件的类
    private class MainViews
    {
        ImageView imageView;
        TextView textView;
    }

}
