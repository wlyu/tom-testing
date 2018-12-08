# -*- coding: utf-8 -*-
import re

import os
import traceback

import requests;
import time

import xlsxwriter
from PIL import Image
from bs4 import BeautifulSoup
from selenium import webdriver


def test():
    url_main = 'http://www.louisvuitton.cn/zhs-cn/homepage?campaign=sem_BaiduBrandzone_EC_Brand_H1_homepage'
    response = requests.get(url_main)
    if response.status_code == 200:
        html = response.text;
        soup = BeautifulSoup(html, "html.parser")
        # print soup.nav.ul
        li = soup.findAll(id=['hm-homme', 'hm-femme'])
        for i in li:
            menu1 = i.find(class_='mega-menu-sup-title title-2')
            # print menu1.get_text()
            menu2s = i.find_all(attrs={'class': re.compile("mega-menu-item$")})
            for menu2 in menu2s:
                leftMenu = menu2.find(class_='onlyML').get_text().strip()
                # 具体逻辑，暂时先一个“全部”
                if leftMenu == u'时尚手袋':
                    for menu3 in menu2.find_all(class_='mm-block'):
                        collect = menu3.find(class_='mm-push-link')
                        if collect.get_text().strip() == u'全系列手袋':
                            # print  " " + collect.get_text() + " " + collect.attrs['href']
                            chrome(collect.attrs['href'].strip())
                            # products-page
                            # product-detail
                else:
                    print "--"
            print '------'
    else:
        print "error"


def chrome(url):
    driver = webdriver.Chrome()
    driver.implicitly_wait(1)
    # driver.maximize_window()
    driver.get(url)
    sroll_multi(driver)
    # list-处理
    html = driver.page_source  # 获取网页的html数据
    soup = BeautifulSoup(html, "html.parser")
    list = soup.find_all(attrs={'class': re.compile("productItemContainer*")})
    data = []
    for content in list:
        imageTmp = ''
        try:
            imageTmp = content.find('img').attrs['src']
        except Exception, err:
            imageTmp = content.find('img').attrs['data-src']
        finally:
            print ''

        tmpURL = "https://www.louisvuitton.cn/ajax/product.jsp?storeLang=zhs-cn&pageType=storelocator_section&id=123456789&requestingURL=" \
                 + "https://www.louisvuitton.cn" + content.find('a').attrs['href'];
        defaultSKU = content.find('a').attrs['id'].split("_")[1]
        detailURLs = [];
        colors = content.find_all('span', attrs={'id': re.compile("facet-link*")})

        if colors != None and len(colors) > 0:
            for color in colors:
                sku = color.attrs['data-evt-product-sku']
                tuml = tmpURL.replace('123456789', color.attrs['data-evt-product-sku'])
                detailURLs.append(tuml + "#" + sku)
        else:
            tuml2 = tmpURL.replace('123456789', defaultSKU)  # id="sku_M52514"
            detailURLs.append(tuml2 + "#" + defaultSKU);

        for detailURL in detailURLs:

            try:
                skuNow = detailURL.split('#')[1]
                # print detailURL
                if len(detailURLs) > 1:
                    image = imageTmp.replace(defaultSKU, skuNow)
                else:
                    image = imageTmp
                name = content.find('div', attrs={'class': re.compile("productName*")}).get_text().strip()

                response2 = requests.get(detailURL)
                descript = ''
                if response2.status_code == 200:
                    html2 = response2.text;
                    soup2 = BeautifulSoup(html2, "html.parser")
                    # sku = soup2.find('div', class_='sku reading-and-link-text').get_text().strip()
                    # print name
                    price = soup2.select('td[class="priceValue price-sheet"]')[0].text.strip()
                    detailImageList = []  ## 空列表
                    tmpList = soup2.find_all("li", id=re.compile("productSheetSlideshowItem*"))

                    for img in tmpList:
                        tmpBigImage = img.find('img').attrs['data-src']
                        detailImageList.append(tmpBigImage)

                    descripts = soup2.find(class_="innerContent functional-text").get_text().strip()

                singleProduct = {
                    "image": image,
                    "name": name,
                    "price": price,
                    "fullName": skuNow,
                    "descript": descripts,
                    "detailImageList": detailImageList
                }

                data.append(singleProduct)
            except Exception, err:
                traceback.print_exc()

    saveFile(data)


def sroll_multi(driver, times=2, loopsleep=3):
    # 40 titles about 3 times
    for i in range(times):
        time.sleep(loopsleep)
        print "Scroll foot %s time..." % i
        scroll_foot(driver)


# 拉到底部
def scroll_foot(driver):
    js = "var q=document.documentElement.scrollTop=100000"
    driver.execute_script(js)


root = "D:\\data\\image\\"
rootIndex = "D:\\data\\image\\index\\"


def saveImage(root,url, fileName):
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
        raise e


def saveFile(data):
    list = ["image", "name", "price", "fullName", "descript", "detailImageList"]
    workbook = xlsxwriter.Workbook("d:\\test.xlsx")
    sheet1 = workbook.add_worksheet()

    cell_format = workbook.add_format()
    cell_format.set_text_wrap()
    # 第一行
    for i in range(0, len(list)):
        sheet1.write(0, i, list[i])
    # 数据
    for line in range(1, len(data) + 1):
        sheet1.set_row(line, 150)  # 设置第一行的高度为256
        # print data[line - 1]
        nameTmp =  (data[line - 1]['name'] + data[line - 1]['fullName']).strip();
        for j in range(0, len(list)):
            if j == 0:
                fileName = nameTmp + ".png";
                saveImage(root,data[line - 1][list[j]], fileName)
                img = Image.open(root + fileName)
                x_scale = 0.5
                y_scale = 0.5
                if img.size[0] >= 2000:
                    x_scale = 0.1
                    y_scale = 0.1
                sheet1.insert_image(line, j, root + fileName, {'x_scale': x_scale, 'y_scale': y_scale})
                sheet1.set_column(j, j, 56)
            elif j == len(list) - 1:
                index=1;
                for detail in data[line - 1][list[j]]:
                    #print  detail
                    fileName = nameTmp + str(index) + ".png";
                    index=index+1
                    j = j + 1
                    saveImage(rootIndex,detail, fileName)
                    img = Image.open(rootIndex + fileName)
                    x_scale = 0.5
                    y_scale = 0.5
                    if img.size[0] >= 2000:
                        x_scale = 0.1
                        y_scale = 0.1

                    sheet1.insert_image(line, j, rootIndex + fileName, {'x_scale': x_scale, 'y_scale': y_scale})
                    sheet1.set_column(j, j, 28)

            else:
                sheet1.write(line, j, data[line - 1][list[j]], cell_format)
                if j == len(list) - 2:
                    sheet1.set_column(j, j, 56)
                else:
                    sheet1.set_column(j, j, 25)
    workbook.close()


if __name__ == '__main__':
    test()
    # saveFile(None)
