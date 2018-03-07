package com.example.myapplication.adapter;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.TextView;
import com.example.myapplication.R;
import com.example.myapplication.domain.ContactInfo;

import java.util.List;

/**
 * Created by wangly on 2017/9/14.
 */
public class ContactAdapter extends BaseAdapter {

    private List<ContactInfo> list;
    private Context context;

    public ContactAdapter(List<ContactInfo> list, Context context) {
        super();
        this.list = list;
        this.context = context;
    }

    @Override
    public int getCount() {
        return list.size();
    }

    @Override
    public Object getItem(int i) {
        return list.get(i);
    }

    @Override
    public long getItemId(int i) {
        return i;
    }

    @Override
    public View getView(int i, View view, ViewGroup viewGroup) {
        ViewHolder viewHolder = null;
        if (view == null) {
            viewHolder = new ViewHolder();
            view = View.inflate(context, R.layout.item_list_contact_select, null);
            viewHolder.mNameTv = view.findViewById(R.id.tv_name);
            viewHolder.mPhoneTv = view.findViewById(R.id.tv_phone);
            viewHolder.image = view.findViewById(R.id.view1);

            view.setTag(viewHolder);
        } else {
            viewHolder = (ViewHolder) view.getTag();
        }
        viewHolder.mNameTv.setText(list.get(i).getName());
        viewHolder.mPhoneTv.setText(list.get(i).getPhone());
        viewHolder.image.setImageBitmap(list.get(i).getImage());
        return view;
    }

    class ViewHolder {
        ImageView image;
        TextView mNameTv;
        TextView mPhoneTv;
    }
}
