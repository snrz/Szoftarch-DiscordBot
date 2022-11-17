from pymongo import MongoClient, errors
import libraries.conf_parser as conf_parser


class DBManager():

    def __init__(self) -> None:
        addr = conf_parser.parse_db_config('config/db_config.json')
        
        try:
            self.client = MongoClient(addr)
        except errors.ServersSelectionTimeoutError as e:
            print(f"[DBManager]: Connection failure, server might not be running {e}")
            return
        
        self.db = None
        self.collection = None

        self.verify_db()
        self.verify_collection()
        print("[DBManager]: Ready")

    def create_filter_from_query(self, query):
        params : list = query.split(',')
        f = {}

        for item in params:
            item = item[1:] if ' ' in item[0] else item
            item_spl = item.split(' ') # p, v

            if 'u' in item_spl:
                f['user'] = item_spl[1]
            if 't' in item_spl:
                f['title'] = ' '.join(item_spl[1:])
            if 'r' in item_spl:
                f['rating'] = {f'${item_spl[1][:-1]}' : item_spl[1][-1]}
            if 'g' in item_spl:
                f['genre'] = item_spl[1]
            if 'ag' in item_spl:
                f['agegroup']: item_spl[1].upper()
            if 'au' in item_spl:
                f['audience'] = ' '.join(item_spl[1:])
        
        print(f)
        return f

    def verify_db(self, db_name : str = 'bot'):
        if db_name not in self.client.list_database_names():
            print(f"[DBManager]: Initializing {db_name} database ..")
        self.db = self.client.bot

    def verify_collection(self, db_name : str = 'bot', coll_name : str = 'movies'):
        if self.db == None:
            self.verify_db(db_name=db_name)

        if coll_name not in self.client[db_name].list_collection_names():
            print(f"[DBManager]: Creating {coll_name} collection")
        self.collection = self.db[coll_name]

    def write_obj_to_collection(self,  obj : dict, coll_name : str = 'movies'):
        self.collection.insert_one(obj)

    def get_user_movie_by_title(self, user, title):
        data = self.collection.find_one({
            "user": f"{user}",
            "title": f"{title}"
        }, {'_id': False})
        if not data:
            print(f"[DBManager]: Entry not found for u:{user} t:{title}")
            # TODO: Exception
            return None
        print (f"Got Obj: {data}")
        return data

    def update_user_movie_by_title(self, user, title, diff_obj):

        self.collection.update_one (
            { "user": f"{user}", "title": f"{title}"},
            { "$set": diff_obj }
        )

    def delete_user_movie_by_title(self, user, title):
        self.collection.delete_one (
            { "user": f"{user}", "title": f"{title}" }
        )

    def delete_user_movies(self, user):
        self.collection.delete_many (
            { "user": f"{user}" }
        )

    def get_user_movies_by_query(self, query):
        search_filter = self.create_filter_from_query(query)
        if not search_filter.get('user', []):
            return self.collection.find(search_filter, {'_id': False}).sort('rating', -1).limit(100)
        return self.collection.find(search_filter, {'_id': False}) # TODO Refactor TopMovies logic
    
    def test_query(self):
        return [i for i in self.collection.find({'user': 'test', 'rating': {'$gte': '4'}})]

    def load_dummy_entries(self, n):
        for i in range(n):
            self.collection.insert_one({
                'title': 'Avengers 5',
                'genre': 'Action',
                'rating': '3',
                'agegroup': '16',
                'audience': 'Best With Friends',
                'user': 'test'
            })
    
    def get_user_movies(self, user):
        return [item for item in self.collection.find({"user": f"{user}"}, {'_id': False})]
