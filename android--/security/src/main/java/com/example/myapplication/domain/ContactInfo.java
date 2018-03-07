package com.example.myapplication.domain;

import android.graphics.Bitmap;

import java.io.Serializable;

/**
 * Created by wangly on 2017/9/14.
 */
public class ContactInfo implements Serializable {
    private String id;
    private String name;
    private String phone;
    private Bitmap image;

    public Bitmap getImage() {
        return image;
    }

    public void setImage(Bitmap image) {
        this.image = image;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
