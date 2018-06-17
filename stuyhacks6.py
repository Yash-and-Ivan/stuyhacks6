from flask import Flask
from flask import render_template, request
from PIL import Image
from google.oauth2 import service_account
from google.cloud import vision
from google.cloud.vision import types
import io
import json
from googletrans import Translator
import webcolors
import wordninja

app = Flask(__name__)

#TODO: configurations (move this later lmao)
APP_NAME = "???"
LANGUAGES = {
    'es': 'Spanish',
    'ru': 'Russian',
    'abc': 'lmaooo'
}
GOOGLE_APPLICATION_CREDENTIALS = ""


@app.route('/')
@app.route('/index/')
def index():
    return render_template('index.html', TITLE=APP_NAME)


@app.route('/learn/<language>')
def learn(language=None):
    toLearn = LANGUAGES[language]
    return render_template('learn.html', TITLE="learn", language=language, fulllanguage=toLearn)


@app.route('/analyze/<lang>', methods=['POST'])
def analyze(lang=None):


    #return """{"imagelabels": [["product", "producto"], ["personal protective equipment", "equipo de protecci\u00f3n personal"], ["wheel", "rueda"]], "imagecolors": [["grey", "gris", "rgb(121.0, 115.0, 123.0)"], ["ghost white", "fantasma blanco", "rgb(249.0, 245.0, 250.0)"], ["chocolate", "chocolate", "rgb(207.0, 68.0, 31.0)"], ["orange red", "rojo naranja", "rgb(245.0, 98.0, 13.0)"], ["light salmon", "salm\u00f3n claro", "rgb(254.0, 178.0, 129.0)"], ["dim gray", "gris tenue", "rgb(91.0, 86.0, 95.0)"], ["silver", "plata", "rgb(197.0, 189.0, 195.0)"], ["darkgrey", "gris oscuro", "rgb(164.0, 154.0, 160.0)"], ["dark slate grey", "gris pizarra oscuro", "rgb(56.0, 50.0, 57.0)"]]}"""
    image = Image.open(request.files['file'])

    imagebytes = io.BytesIO()
    image.save(imagebytes, format='png')

    processed = types.Image(content=imagebytes.getvalue())

    response = dict()

    labels = googleVision.label_detection(processed).label_annotations
    colors = googleVision.image_properties(processed).image_properties_annotation.dominant_colors.colors

    for c in colors:
        print(c)

    response["imagelabels"] = [[label.description, translator.translate(label.description, dest=lang, ).text] for label in labels]
    response["imagecolors"] = []
    tempNames = []
    for color in colors:
        r = color.color.red
        g = color.color.green
        b = color.color.blue
        colorText = "rgb(" + str(r) + ", " + str(g) + ", " + str(b) + ")"
        colorName = closestColor((r, g, b))
        if colorName not in tempNames:
            tempNames.append(colorName)
        else:
            continue
        #very specific case that doesn't work???
        if colorName == "or angered":
            colorName = "orange red"

        response["imagecolors"].append([colorName, translator.translate(colorName, dest=lang).text, colorText])

    print(response)

    return json.dumps(response)


def closestColor(requested_colour):
    min_colours = {}
    for key, name in webcolors.css3_hex_to_names.items():
        r_c, g_c, b_c = webcolors.hex_to_rgb(key)
        rd = (r_c - requested_colour[0]) ** 2
        gd = (g_c - requested_colour[1]) ** 2
        bd = (b_c - requested_colour[2]) ** 2
        min_colours[(rd + gd + bd)] = name
    return " ".join(wordninja.split(min_colours[min(min_colours.keys())]))


if __name__ == '__main__':
    #create credentials
    credentials = service_account.Credentials.from_service_account_file('D:\stuyhacks6\key.json')

    #create google vision object
    googleVision = vision.ImageAnnotatorClient(credentials=credentials)

    #create translator
    translator = Translator()


    app.run(debug=True, host='0.0.0.0')
