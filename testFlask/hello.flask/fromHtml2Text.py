# -*- coding: utf-8 -*-
import re
import traceback
import requests;
from bs4 import BeautifulSoup

domain = 'https://www.louisvuitton.cn'
prexUrl = "https://www.louisvuitton.cn/ajax/product.jsp?" \
          "storeLang=zhs-cn&pageType=storelocator_section&id={}&requestingURL=";
# step1
bagUrlDetailList = []
# data
data = []


def clickDetail(sku, url):
    bagUrlDetailList.append(prexUrl.format(sku) + "" + url)
    pass


def html2Data(list):
    for productItem in list:

        defaultUrl = domain + productItem.find('a').attrs['href'];
        defaultSku = productItem.find('a').attrs['data-sku'];
        stickersList = productItem.find('div', class_='stickersList');
        if stickersList == None:
            clickDetail(defaultSku, defaultUrl + "#" + defaultSku)
        else:
            for single in stickersList.find_all('span'):
                sku = single.attrs['data-evt-product-sku']
                clickDetail(sku, defaultUrl + "#" + sku)


def getWomenBagUrl():

    return domain + "/ajax/endeca/browse-frag/women/handbags/all-handbags/_/N-1ouyuai?" \
                    "storeLang=zhs-cn&pageType=category&Nrpp=18&recordsPerPage=18&showColor=true&No="


def getWomenPiJu():

    return domain + "/ajax/endeca/browse-frag/women/small-leather-goods/_/N-1a3ujkn?" \
                    "storeLang=zhs-cn&pageType=category&Nrpp=18&recordsPerPage=18&showColor=true&No="


def getAllDetailUrls(originUrl):
    pageNum = 0;
    while (True):
        url = originUrl + str(pageNum * 18)
        response = requests.get(url)
        if response.status_code == 200:
            html = response.text;
            soup = BeautifulSoup(html, "html.parser")
            list = soup.find_all('div', class_='productItemContainer')
            if list == None or len(list) < 1:
                print 'end'
                break;
            else:
                pageNum = pageNum + 1
                html2Data(list)
        else:
            print 'error'


def singleMainUrl(originUrl, sex, bigType, smallType):
    getAllDetailUrls(originUrl)
    # step2  detail-Object
    if len(bagUrlDetailList) > 0:
        for url in bagUrlDetailList:
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    html = response.text;
                    soup = BeautifulSoup(html, "html.parser")
                    name = soup.find('div', id='productName').find('h1').text.strip()
                    sku = url.split('#')[1].strip()
                    color = ''
                    if soup.find('div', class_='tableTopPanel'):
                        soup.find('div', class_='tableTopPanel').find('span').text.strip()

                    desc = soup.find('div', itemprop="description").get_text().strip()
                    pri = soup.select('td[class="priceValue price-sheet"]')
                    if pri and len(pri) > 0:
                        price = pri[0].text.strip()
                    else:
                        price = 0
                    descripts = soup.find(class_="innerContent functional-text").get_text().strip()
                    tmpList = soup.find_all("li", id=re.compile("productSheetSlideshowItem*"))
                    detailImageList = []  ## 空列表
                    for img in tmpList:
                        if img.find('img'):
                            tmpBigImage = img.find('img').attrs['data-src']
                            detailImageList.append(tmpBigImage)
                        else:
                            print url

                    singleProduct = {
                        "name": name,
                        "sku": sku,
                        "color": color,
                        "price": price,
                        "descript": descripts,
                        "desc": desc,
                        "detailImageList": detailImageList,
                        "html": html,
                        "sex": sex,
                        "bigType": bigType,
                        "smallType": smallType
                    }
                    data.append(singleProduct)
            except Exception, err:
                traceback.print_exc()
                print url
    nameFile=sex + "_" +bigType+"_"+smallType
    print  nameFile
    f2 = open('D:\\tmp\\{}.txt'.format(nameFile).decode('utf-8'), 'w')
    for d in data:
        f2.write('\n' + str(d))
    f2.close()


if __name__ == '__main__':
    # step1  detail_input_list
    # 第一步：1-確定連接、2-還有性別、3-類型

    tmpData=[
        {"url": domain + "/ajax/endeca/browse-frag/men/small-leather-goods/all-collections/_/N-1ssq7yh?"
                         "storeLang=zhs-cn&pageType=category&Nrpp=18&recordsPerPage=18&showColor=true&No=",
         "sex": "男",
         "bigType": "皮具",
         "smallType": "all"
         }
        # {"url":domain+"/ajax/endeca/browse-frag/men/men-s-bags/totes/_/N-613u94?"
        #        "storeLang=zhs-cn&pageType=category&Nrpp=18&recordsPerPage=18&showColor=true&No=",
        #  "sex":"男",
        #  "bigType":"包袋",
        #  "smallType":"手袋"
        #  },
        # {"url": domain + "/ajax/endeca/browse-frag/men/men-s-bags/business-bags/_/N-nvagd1?"
        #                  "storeLang=zhs-cn&pageType=category&Nrpp=18&recordsPerPage=18&showColor=true&No=",
        #  "sex": "男",
        #  "bigType": "包袋",
        #  "smallType": "公文包"
        #  }
        # ,
        # {"url": domain + "/ajax/endeca/browse-frag/men/men-s-bags/messenger-bags/_/N-n0tbty?"
        #                  "storeLang=zhs-cn&pageType=category&Nrpp=18&recordsPerPage=18&showColor=true&No=",
        #  "sex": "男",
        #  "bigType": "包袋",
        #  "smallType": "邮差包"
        #  }
        # ,
        # {"url": domain + "/ajax/endeca/browse-frag/men/men-s-bags/backpacks/_/N-11r7gti?"
        #                  "storeLang=zhs-cn&pageType=category&Nrpp=18&recordsPerPage=18&showColor=true&No=",
        #  "sex": "男",
        #  "bigType": "包袋",
        #  "smallType": "双肩包"
        #  }
        # ,
        # {"url": domain + "/ajax/endeca/browse-frag/men/men-s-bags/small-bags/_/N-1quoex8?"
        #                  "storeLang=zhs-cn&pageType=category&Nrpp=18&recordsPerPage=18&showColor=true&No=",
        #  "sex": "男",
        #  "bigType": "包袋",
        #  "smallType": "手包与腰包"
        #  }
    ]

    tmpData = [
        {"url": getWomenPiJu(),
         "sex": "女",
         "bigType": "皮具",
         "smallType": "all"
         }]
    for d in tmpData:
        singleMainUrl(d['url'],d['sex'],d['bigType'],d['smallType'])
        print "\n"
