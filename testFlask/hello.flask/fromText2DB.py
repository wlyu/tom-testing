# -*- coding: utf-8 -*-
import json
import sqlite3

import os
import traceback

import requests
import thread


def go():
    conn = sqlite3.connect('test123.db')
    cursor = conn.cursor()
    cursor.execute('create table product (sku varchar(20) primary key, name varchar(20), color varchar(20), '
                   'price varchar(20),descript TEXT ,desc TEXT, detailImageList BLOB, html BLOB)')
    # cursor.execute('insert into product (sku, name) values (\'1\', \'Michael\')')
    # cursor.rowcount
    cursor.close()
    conn.commit()
    conn.close()


sql = 'INSERT INTO "main"."product" ("sku", "name", "color", "price", "descript", "desc", ' \
      '"detailImageList", "html", "sex", "bigType", "smallType") ' \
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';


        # "sex":"男",
        #  "bigType":"包袋",
        #  "smallType":"手袋"
def do2(list):
    conn = sqlite3.connect('test123.db')
    cursor = conn.cursor()
    for obj in list:
        try:
            #print obj['html']
            cursor.execute(sql, (obj['sku'],
                                 obj['name'],
                                 obj['color'],
                                 obj['price'],
                                 obj['descript'],
                                 obj['desc'],
                                 ','.join(obj['detailImageList']),
                                 obj['html'],
                                 obj['sex'].decode('utf8'),
                                 obj['bigType'].decode('utf8'),
                                 obj['smallType'].decode('utf8'),))
        except Exception, err:
            traceback.print_exc()
            print obj

    cursor.rowcount
    cursor.close()
    conn.commit()
    conn.close()


def save2DB(fileNamePath):
    f = open(fileNamePath, 'r')
    lines = f.readlines()
    list = []
    i = 0
    for line in lines:
        if len(list) == 100:
            do2(list)
            list = []
            continue

        i = i + 1

        if line.strip() == '':
            print str(i) + "空行"
        else:
            list.append(eval(line))

    f.close()


def select():
    conn = sqlite3.connect('test123.db')
    cursor = conn.cursor()
    cursor.execute('select * from product where sku=?', ('M44155',))
    values = cursor.fetchall()
    print  values
    cursor.close()
    conn.commit()
    conn.close()


root = "D:\\tom-testing\\testFlask\\myflask\\static\\image\\";


def saveImage(url, fileName):
    path = root + fileName
    try:
        if not os.path.exists(root):
            os.mkdir(root)
        if not os.path.exists(path):
            r = requests.get(url)
            r.raise_for_status()
            # 使用with语句可以不用自己手动关闭已经打开的文件流
            with open(path, "wb") as f:  # 开始写文件，wb代表写二进制文件
                f.write(r.content)
            print("完成")
        else:
            print("已存在")
    except Exception as e:
        traceback.print_exc()


def fromDb2LocalImage():
    conn = sqlite3.connect('test123.db')
    cursor = conn.cursor()
    cursor.execute('select * from product')
    values = cursor.fetchall()
    cursor.close()
    conn.commit()
    conn.close()
    for line in values:
        print line
        for singleImage in line[6].split(','):
            saveImage(singleImage, singleImage[singleImage.find('--') + 2:singleImage.find(u'.jpg?') + 4])
    print '\n'
    

if __name__ == '__main__':
    # go()
    # os._exit(1)
    #save2DB
    # filePath="d:\\tmp\\";
    # pathDir = os.listdir(filePath)
    # for allDir in pathDir:
    #     child = os.path.join('%s%s' % (filePath, allDir))
    #     print child.decode('gbk')
    #     try:
    #         thread.start_new_thread(save2DB, (child, ))
    #     except:
    #         print "Error: unable to start thread"
    #
    # while 1:
    #     pass
    ##---------------------------------------
    fromDb2LocalImage()