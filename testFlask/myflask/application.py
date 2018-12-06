from flask import render_template, app, Flask, send_file

app = Flask(__name__)


@app.route('/hello/')
@app.route('/hello/<name>')
def hello(name=None):
    return render_template('hello.html', name=name)

@app.route('/index2')
def index2():
    return send_file("templates/index2.html")

@app.route('/')
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run()
