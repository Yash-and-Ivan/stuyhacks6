from flask import Flask
from flask import render_template

app = Flask(__name__)

#configurations (move this later lmao)
APP_NAME = "???"
LANGUAGES = {
    'es': 'spanish',
    'abc': 'lmaooo'
}


@app.route('/')
@app.route('/index/')
def index():
    return render_template('index.html', TITLE=APP_NAME)


@app.route('/learn/<language>')
def learn(language=None):
    toLearn = LANGUAGES[language]
    return render_template('learn.html', language=toLearn)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
