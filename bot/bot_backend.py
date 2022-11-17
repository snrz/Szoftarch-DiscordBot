from flask import Flask, request, abort
import json

import db_manager

app = Flask(__name__)

manager = db_manager.DBManager() # For now


# TODO: admin func
def delete_handler(r):
    data = dict(r)
    user_name = data.get('user', [])
    title = data.get('title', [])

    if not title: # Delete user's list
        manager.delete_user_movies(user=user_name)
        return json.dumps({'success': True}), 200, {'ContentType':'application/json'} 
    else:
        manager.delete_user_movie_by_title(user=user_name, title=title)
        if not manager.get_user_movie_by_title(user=user_name, title=title):
            return json.dumps({'success': False}), 404, {'ContentType':'application/json'} 
        else:
            return json.dumps({'success': True}), 200, {'ContentType':'application/json'} 

def update_handler(r): # TODO: Error Handling
    data = dict(r)

    user_name = data.get('user', [])
    title = data.get('title', [])

    if not get_movies_by_title(user_name, title):
        return json.dumps({'success': False}), 404, {'ContentType':'application/json'}

    stored = manager.get_user_movie_by_title(user=user_name, title=title)
    manager.update_user_movie_by_title(
        user_name,
        title,
        {k: data[k] for k in data if data[k] != stored[k]}
    )
    return json.dumps({'success': True}), 200, {'ContentType':'application/json'} 

def upload_handler(r):
    data = dict(r)

    user_name = data.get('user', [])
    title = data.get('title', [])

    if len(data.keys()) != 6: # TODO: Scheme validation
        return json.dumps({'success': False}), 418, {'ContentType':'application/json'}
    elif len(data.keys()) == 6:
        for v in data.values():
            if v in ["", None]:
                return json.dumps({'success': False}), 400, {'ContentType':'application/json'} 

    if get_movies_by_title(user_name, title):
        return json.dumps({'success': False}), 404, {'ContentType':'application/json'}
    else:
        manager.write_obj_to_collection(data)
        return json.dumps({'success': True}), 200, {'ContentType':'application/json'} 

@app.route("/")
def hello_world():
    return "<p>Mellow World</p>"

@app.get("/movies/<user>")
def get_movies(user):
    return manager.get_user_movies(user=user)

@app.get("/movies/<user>/<title>")
def get_movies_by_title(user, title):
    return manager.get_user_movie_by_title(user=user, title=title)

@app.get("/movies/query/<query_str>")
def get_movies_by_query(query_str):
    return list(manager.get_user_movies_by_query(query=query_str))

@app.post("/delete")
def delete_user_movie():
    return delete_handler(request.json)

@app.put("/update")
def update_user_movie():
    return update_handler(request.json)

@app.post("/upload")
def upload_user_movie():
    return upload_handler(request.json)