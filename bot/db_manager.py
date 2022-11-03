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
        })
        if not data:
            print(f"[DBManager]: Entry not found for u:{user} t:{title}")
            # TODO: Exception
            return None
        print (f"Got Obj: {data}")
        return data

    def update_user_movie_by_title(self, user, title, diff_obj):

        self.collection.update_one(
            {
                "user": f"{user}",
                "title": f"{title}"
            },
            {
                "$set": diff_obj
            }
        )

    def get_user_movies(self, user):
        return [item for item in self.collection.find({"user": f"{user}"})]