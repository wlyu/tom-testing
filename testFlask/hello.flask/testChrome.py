# coding=utf-8

# refer to http://www.cnblogs.com/haigege/p/5492177.html
# Step1: scroll and generate Markdown format Menu
import xlsxwriter
import xlwt
from selenium import webdriver
import time
#pip install Pillow


def scroll_top(driver):
    # 将滚动条移动到页面的底部
    js = "var q=document.documentElement.scrollTop=100000"
    driver.execute_script(js)
    time.sleep(5)
    # 将滚动条移动到页面的顶部
    # js = "var q=document.documentElement.scrollTop=0"

    # 若要对页面中的内嵌窗口中的滚动条进行操作，要先定位到该内嵌窗口，在进行滚动条操作
    # js = "var q=document.getElementById('id').scrollTop=100000"
    # driver.execute_script(js)


# 拉到底部
def scroll_foot(driver):
    js = "var q=document.documentElement.scrollTop=100000"
    driver.execute_script(js)
    time.sleep(5)


def write_text(filename, info):
    """
    :param info: 要写入txt的文本内容
    :return: none
    """
    # 创建/打开info.txt文件，并写入内容
    with open(filename, 'a+') as fp:
        fp.write(info.encode('utf-8'))
        fp.write('\n'.encode('utf-8'))
        fp.write('\n'.encode('utf-8'))


def sroll_multi(driver, times=2, loopsleep=2):
    # 40 titles about 3 times
    for i in range(times):
        time.sleep(loopsleep)
        print "Scroll foot %s time..." % i
        scroll_foot(driver)
    time.sleep(loopsleep)


# Note: titles is titles_WebElement type object
def write_menu(filename, titles):
    with open(filename, 'w') as fp:
        pass
    for title in titles:
        print title.text;

        # assert type(title) == "WebElement"
        # print type(title)


def main(url):
    # eg. <a class="title" href="/p/6f543f43aaec" target="_blank"> titleXXX</a>
    driver = webdriver.Chrome()
    driver.implicitly_wait(10)
    # driver.maximize_window()
    driver.get(url)
    sroll_multi(driver)
    titles = driver.find_elements_by_xpath('.//a[@class="title"]|.//a[target="_blank"]')
    write_menu(filename, titles)


if __name__ == '__main2__':
    # sample link
    url = 'http://www.jianshu.com/u/73632348f37a'
    filename = r'info.txt'
    main(url)

if __name__ == '__main33__':
    list = ['name', 'age', 'class','image']
    workbook = xlsxwriter.Workbook("d:\\test.xlsx")
    sheet1 = workbook.add_worksheet()
    # 第一行
    for i in range(0, len(list)):
        sheet1.write(0, i, list[i])
    # 数据
    for line in range(1, 10):
        sheet1.set_row(line, 300)  # 设置第一行的高度为256
        for j in range(0, len(list)):
            if j==len(list)-1:
                image_width = 128
                image_height = 128
                cell_width = 128
                cell_height = 128
                x_scale = cell_width / image_width
                y_scale = cell_height / image_height
                sheet1.insert_image(line,j, 'C:\Users\wangly\Desktop\\aBig.png', {'x_scale': x_scale, 'y_scale': y_scale})
                sheet1.set_column(j,j, 50)
            else:
                sheet1.write(line, j, str(line) + "--" + str(j))
    workbook.close()

if __name__ == '__main__':
    aList = [123, 'xyz', 'xyz','zara', 'abc'];
    for j in aList:
        print aList.index(j)