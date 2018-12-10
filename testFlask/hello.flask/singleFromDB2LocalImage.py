# coding=utf-8
import sqlite3
import thread
from fromText2DB import save2DB
from fromText2DB import saveImage


def fromDb2LocalImage():
    conn = sqlite3.connect('test123.db')
    cursor = conn.cursor()
    cursor.execute('select * from product where smallType=?', ("all",))
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
    filePath = "d:\\tmp\\女_皮具_all.txt".decode("utf-8");
    save2DB(fileNamePath=filePath)