import sqlite3

import re
from bs4 import BeautifulSoup
from flask import render_template, app, Flask, send_file, request

app = Flask(__name__)


# app = Flask(__name__, static_folder='../static')


@app.route('/hello/')
@app.route('/hello/<name>')
def hello(name=None):
    return render_template('hello.html', name=name)


@app.route('/')
def index():
    conn = sqlite3.connect('../hello.flask/test123.db')
    cursor = conn.cursor()
    cursor.execute('select sku,name,detailImageList,price from product')
    values = cursor.fetchall()
    cursor.close()
    conn.commit()
    conn.close()
    data = []
    for value in values:
        singleImage = value[2]
        v2 = "/static/image/" + singleImage[singleImage.find('--') + 2:singleImage.find(u'.jpg?') + 4]
        print v2
        data.append((value[0], value[1], v2, value[3]))
    return render_template("index.html", values=data)


@app.route('/detail')
def from1_1_to_2():
    id = request.args.get("id")
    return render_template("detail.html", id=id)

@app.route('/product')
def product():
    id = request.args.get("id")
    conn = sqlite3.connect('../hello.flask/test123.db')
    cursor = conn.cursor()
    cursor.execute('select * from product where sku=?', (id,))
    values = cursor.fetchall()
    cursor.close()
    conn.commit()
    conn.close()
    html = values[0][7];
    html= (re.sub(r'\bhttps\S*?\-\-\b', 'http://127.0.0.1:5000/static/image/', html, re.S))

    # if img.attrs['src']==None:
    #     continue
    #
    # singleImage=img.attrs['src']
    # v2="/static/image/"+singleImage[singleImage.find('--') + 2:singleImage.find(u'.jpg?') + 4]
    # img["src"]=v2
    return html


if __name__ == '__main__':
    app.run(debug=True)
