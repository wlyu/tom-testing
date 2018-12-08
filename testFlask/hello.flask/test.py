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
    # filePath = "d:\\tmp\\男_皮具_all.txt".decode("utf-8");
    for i in range(0,10):
        thread.start_new_thread(fromDb2LocalImage(),);
    while 1:
        pass
