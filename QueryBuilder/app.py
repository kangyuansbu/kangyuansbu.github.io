import ast

from flask import Flask
from flask import render_template, request

import pgConnect

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('login.html')


@app.route('/auth', methods=['GET', 'POST'])
def authenticate():
    registry = {'admin': 'admin', 'paul': 'paul'}
    if request.method == 'GET':
        return render_template('login.html')
    else:
        name = request.form['name']
        passw = request.form['pass']
        if name in registry.keys() and passw == registry[name]:
            return render_template('index.html')
        else:
            return render_template('fail.html')
        
@app.route("/logout", methods = ["GET", "POST"])
def logout():
    # logout_user()
    return render_template("login.html")

@app.route('/getQueryResults', methods=('GET', 'POST'))
def getQueryResults():
    rules_json = request.get_json()
    print("reached server", rules_json)
    print()

    with open('arguments.txt', 'r') as f:
        args = ''
        for line in f.readlines():
            line = line.strip()
            args += line
        f.close()

    args = "".join(args).strip('\n')
    args_dict = ast.literal_eval(args)

    schema = args_dict['schema']
    db = pgConnect.db(schema)

    data_json = db.get_data(rules_json, database=args_dict['database'], user=args_dict['user'],
                            password=args_dict['password'], host=args_dict['host'], port=args_dict['port'])

    return data_json


if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.run(debug=True)
