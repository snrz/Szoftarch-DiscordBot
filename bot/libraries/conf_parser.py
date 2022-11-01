import json
import re

def parse_credentials_form_config(conf_path : str):
    with open(conf_path, 'r') as fp:
        content = json.load(fp)
        return content['access_token'], content['guild_id'], content['imdb_data']

async def get_items_by_title(file_path, target : str):
        if target == '':
            print("Target not specified")
            return None # TODO: Proper error handling
        with open(file_path, 'r') as infile:
            content = infile.read()
            q = re.compile(f'[^\"]*{target}[^\"]*')
            result = list(set(q.findall(content)))
            # Only return the 25 best matches as ui.Select has limited capabilities
            return result[:25]