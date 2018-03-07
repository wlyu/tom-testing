package com.example.myapplication.util;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Context;
import android.content.res.Resources;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.provider.ContactsContract;
import com.example.myapplication.R;
import com.example.myapplication.domain.ContactInfo;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by wangly on 2017/9/14.
 */
public class ContactInfoParser {



    public static List<ContactInfo> getSysConstact(Context context,Bitmap defaultBitmap) {
        ContentResolver contentResolver = context.getContentResolver();
        //查询联系人列表
        Uri uri = Uri.parse("content://com.android.contacts/raw_contacts");
        Uri dataUri = Uri.parse("content://com.android.contacts/data");

        List<ContactInfo> list = new ArrayList<ContactInfo>();
        Cursor cusor = contentResolver.query(uri,
                new String[]{"contact_id"}, null, null, null);
        while (cusor.moveToNext()) {
            String id = cusor.getString(0);
            if (id != null) {
                ContactInfo info = new ContactInfo();
                info.setId(id);

                //name + phone
                Cursor cursor2 = contentResolver.query(dataUri,
                        new String[]{"data1", "mimetype"}, "raw_contact_id=?", new String[]{id}, null);
                while (cursor2.moveToNext()) {
                    String data1 = cursor2.getString(0);
                    String mimetype = cursor2.getString(1);
                    switch (mimetype) {
                        case "vnd.android.cursor.item/name":
                            info.setName(data1);
                            break;
                        case "vnd.android.cursor.item/phone_v2":
                            info.setPhone(data1);
                            break;

                    }

                }

                //头像
                Bitmap bitmap = openPhoto(contentResolver, id);
                if(bitmap==null){
                    bitmap = defaultBitmap;
                }
                info.setImage(bitmap);
                list.add(info);
                cursor2.close();
            }
        }
        cusor.close();
        return list;

    }


    public static Bitmap openPhoto(ContentResolver contentResolver, String contactId) {

        Uri contactUri = ContentUris.withAppendedId(ContactsContract.Contacts.CONTENT_URI, Long.valueOf(contactId));
        Uri photoUri = Uri.withAppendedPath(contactUri, ContactsContract.Contacts.Photo.CONTENT_DIRECTORY);
        Cursor cursor = contentResolver.query(photoUri,
                new String[]{ContactsContract.Contacts.Photo.PHOTO}, null, null, null);
        if (cursor == null) {
            return null;
        }
        try {
            if (cursor.moveToFirst()) {
                byte[] data = cursor.getBlob(0);
                if (data != null) {
                    return BitmapFactory.decodeStream(new ByteArrayInputStream(data));
                }
            }
        } finally {
            cursor.close();
        }
        return null;

    }

}
