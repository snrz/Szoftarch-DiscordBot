import json


def parse_credentials_form_config(conf_path: str):
    with open(conf_path, 'r') as fp:
        content = json.load(fp)
        return content['access_token'], content['guild_id'], content['imdb_data']


def parse_db_config(conf_path: str):
    with open(conf_path, 'r') as db_conf:
        content = json.load(db_conf)
        return content['conn_str']
