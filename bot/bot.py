import discord
from discord.ext import commands
from discord import ui
import re

import libraries.conf_parser as conf_parser
import db_manager

access_token, guild_id, imdb_file = conf_parser.parse_credentials_form_config('config/bot_config.json')

my_intents = discord.Intents.default()
my_intents.messages = True
my_intents.message_content = True
my_intents.members = True

''' Blocklist change handler '''
BOT_ACCESS_BLOCKED = []
def handle_blocklist_change(current_state : list):
    global BOT_ACCESS_BLOCKED
    print(f"Change triggered, got: {current_state}")
    BOT_ACCESS_BLOCKED = [user for user in current_state]

ENABLE_INTERACTION_GUARD = True
def blocklist_interaction_gurad(user, enabled = ENABLE_INTERACTION_GUARD):
    print(f"DEBUG: Users on blocklist {BOT_ACCESS_BLOCKED}")
    return True if user in BOT_ACCESS_BLOCKED else False

''' Placeholder for data entry '''
data_store = {
    'title':    None,
    'genre':    None,
    'rating':   None,
    'agegroup': None,
    'audience': None
}

diff_store = {}

def set_diff_store(d : dict):
    for k,v in d.items():
        diff_store[k] = v

async def save_field_value(interaction : discord.Interaction, value, field_type : str, update : bool):
    data_store[field_type] = value
    print (data_store)

    if all(item != None for item in data_store.values()):
        if data_store.get('title', []):
            print(f"DEBUG: Title field set [UpdateMode: {update}]- check if user's list contains {data_store['title']}")
            item_in_users_list = manager.get_user_movie_by_title(interaction.user.name, data_store['title'])
            update = True if item_in_users_list else update # User has an entry of the same movie
            if update: # Set to update instead
                print("DEBUG: Switching to update")
                set_diff_store(item_in_users_list)

        print(f"Store FULL [UpdateMode: {update}]")
        await interaction.response.defer()
        await interaction.followup.send("Ready to submit", view=ButtonView(initiator=interaction.user, update=update))
        return    
    await interaction.response.defer()

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

class ClientClass(commands.Bot):
    def __init__(self):
        super().__init__('$', intents=my_intents)
        self.synced = False
    
    async def on_ready(self):
        await self.wait_until_ready()
        if not self.synced:
            await super().tree.sync(guild = discord.Object(id=guild_id))
            self.synced = True
        print("Ready.")


class ModularView(ui.View):
    def __init__(self, initiator, update : bool = False):
        super().__init__()
        print(f"Modular View Init [owner: {initiator.name}]")
        self.update = update
        self.initiator = initiator

    async def interaction_guard(self, interaction : discord.Interaction):
        if (interaction.user != self.initiator): # Interaction guard
            print(f"DEBUG: Interaction guard - BLOCK - user: {interaction.user.name} owner: {self.initiator.name}")
            await interaction.response.send_message("You are not the owner of this interaction, wait for your turn.", ephemeral=True)
            return True
        print("DEBUG: Interaction guard - OK")
        return False

    @discord.ui.select(
        options = [], # Generated at runtime
        min_values=1,
        max_values=1,
        placeholder="Select Movie Title"
    )
    async def title_callback(self, interaction : discord.Interaction, select : discord.ui.Select):
        if not await self.interaction_guard(interaction):
            print (f"Title picker selection: {select.values[0]}")
            await save_field_value(interaction, select.values[0], 'title', self.update)
        #await interaction.response.defer()

    @discord.ui.select(
        options = [
            discord.SelectOption(label="Horror"),
            discord.SelectOption(label="Action"),
            discord.SelectOption(label="Comedy"),
            discord.SelectOption(label="Sci-fi"),
            discord.SelectOption(label="Documentary")
        ],
        min_values=1,
        max_values=1,
        placeholder="Select Genre"
    )
    async def genre_callback(self, interaction : discord.Interaction, select : discord.ui.Select):
        if not await self.interaction_guard(interaction):
            print (f"Genre picker selection: {select.values[0]}")
            await save_field_value(interaction, select.values[0], 'genre', self.update)
        #await interaction.response.defer()

    @discord.ui.select(
        options = [
            discord.SelectOption(label="1"),
            discord.SelectOption(label="2"),
            discord.SelectOption(label="3"),
            discord.SelectOption(label="4"),
            discord.SelectOption(label="5")
        ],
        min_values=1,
        max_values=1,
        placeholder="Rate Movie"
    )
    async def rating_callback(self, interaction, select):
        if not await self.interaction_guard(interaction):
            print(f"Rating provided: {select.values[0]}")
            await save_field_value(interaction, select.values[0], 'rating', self.update)
        #await interaction.response.defer()

    @discord.ui.select(
        options = [
            discord.SelectOption(label="KN", description=""),
            discord.SelectOption(label="6",  description=""),
            discord.SelectOption(label="12", description=""),
            discord.SelectOption(label="16", description=""),
            discord.SelectOption(label="18", description="")
        ],
        min_values=1,
        max_values=1,
        placeholder="Suggest Age Group"
    )
    async def age_callback(self, interaction : discord.Interaction, select : discord.ui.Select):
        if not await self.interaction_guard(interaction):
            print(f"Age-group: {select.values[0]}")
            await save_field_value(interaction, select.values[0], 'agegroup', self.update)
        #await interaction.response.defer()

    @discord.ui.select(
            options = [
            discord.SelectOption(label="Watch Alone",       description=""),
            discord.SelectOption(label="For Family Time",   description=""),
            discord.SelectOption(label="Best With Friends", description=""),
        ],
        min_values=1,
        max_values=1,
        placeholder="Recommend Audience"
    )
    async def audience_callback(self, interaction : discord.Interaction, select : discord.ui.Select):
        if not await self.interaction_guard(interaction):
            print(f"Recommended Audience: {select.values[0]}")
            await save_field_value(interaction, select.values[0], 'audience', self.update)
        #await interaction.response.defer()


class ButtonView(ui.View):
    def __init__(self, initiator, update : bool = False):
        super().__init__()
        self.update = update
        self.initiator = initiator
    
    async def interaction_guard(self, interaction):
        if (interaction.user != self.initiator): # Interaction guard
            print(f"DEBUG: Button Interaction guard - BLOCK - user: {interaction.user.name} owner: {self.initiator.name}")
            await interaction.response.send_message("You are not the owner of this interaction, wait for your turn.", ephemeral=True)
            return True
        print("DEBUG: Button Interaction guard - OK")
        return False

    @discord.ui.button(
        label="Submit",
        style=discord.ButtonStyle.blurple
    )
    async def on_submit_press(self, interaction : discord.Interaction, button):
        if not await self.interaction_guard(interaction):
            await interaction.response.send_message(f"Input fields ready")
            if self.update:
                await call_db_diff_update()
            else:
                manager.write_obj_to_collection({**data_store, **{'user': f"{interaction.user.name}"}})
            for key in data_store:
                data_store[key] = None

    @discord.ui.button(
        label="Clear",
        style=discord.ButtonStyle.danger
    )
    async def on_clear_press(self, interaction : discord.Interaction, button):
        if not await self.interaction_guard(interaction):
            for key in data_store:
                data_store[key] = None
            await interaction.response.send_modal(MovieForm(initiator=interaction.user))
    

class MovieForm(ui.Modal, title='Questionnaire Response'):

    def __init__(self, initiator):
        super().__init__()
        print("Modal Init")
        self.initiator = initiator # User that owns this interaction

    name = ui.TextInput(label='Movie Title')
    components = [name]
    async def on_submit(self, interaction: discord.Interaction):
        print(f"@QueryMatch: {self.name}")
        
        await interaction.response.defer()

        filtering_routine = get_items_by_title(imdb_file, self.name)
        filtered_list = await filtering_routine

        display_me = ModularView(initiator=self.initiator)
        # Generate suggestions for title select
        display_me.children[0].options=[ discord.SelectOption(label=f"{item}") for item in filtered_list ]

        #TODO: Investigate ephemeral behaviour
        await interaction.followup.send("Select Options:", view=display_me)

### $ Query ###
def construct_update_view(result, initiator):
    print("Construct Called")
    update_view = ModularView(initiator=initiator, update=True)
    #print(update_view.children[0].values)
    update_view.children[0].options.append(
        discord.SelectOption(
            label=result['title'],
            default=True
        )
    )
    return update_view

async def call_db_diff_update(): # TODO: Refactor
    filtered = {k:v for (k,v) in diff_store.items() if k not in ['_id', 'user']}
    data_diff = {k: data_store[k]for k in data_store if k in data_store and data_store[k] != filtered[k]}
    manager.update_user_movie_by_title(diff_store['user'], diff_store['title'], data_diff)

async def send_ctx_reply(ctx, message):
    await ctx.send(message) #TODO: Refactor

async def get_movies_of(ctx, user):
    server_users = [m.name async for m in ctx.guild.fetch_members(limit=None)] # Server member validation
    if user not in server_users:
        await send_ctx_reply(ctx, f"User {user} is not a member of this server.")
        return [None]

    result = manager.get_user_movies(user=user)
    titles = [e['title'] for e in result] # For now
    return titles

async def delete_movie_of(ctx, user, title): #TODO: Refactor
    result = await get_movies_of(ctx, user=user)
    print(result)
    if title not in result:
        await ctx.send(f'Could not find "{title}" in your movies')
    else:
        manager.delete_user_movie_by_title(user=user, title=title)
        await ctx.send(f'{title} - Deleted.')

async def delete_movies_of(user):
    manager.delete_user_movies(user)
    
async def get_movies_by_query(ctx, query):
    r = manager.get_user_movies_by_query(query) # [<str>]
    print(r)
    if '' in r:
        await send_ctx_reply(ctx, "Invalid query.")
        return
    rs = '\n'.join(r)
    print(rs)
    await send_ctx_reply(ctx, f"Result: \n{rs}")

client = ClientClass()

@client.tree.command(name='toggle_test', guild=discord.Object(id=guild_id))
async def testmodal(interaction : discord.Interaction):
    if blocklist_interaction_gurad(interaction.user.name): # Guard
        await interaction.response.send_message("You have been blocked by an admin")
        return
    if manager.get_user_item_count(user=interaction.user.name) == 10: # TODO: Align with frontend (MOVEME)
        await interaction.response.send_message("Your list is already populated, delete something before uploading")
    else:
        await interaction.response.send_modal(MovieForm(initiator=interaction.user))

@client.command()
async def update_movie(ctx : commands.Context, args):
    ''' Update movie from users previous updates (search by title) '''
    if blocklist_interaction_gurad(ctx.author.name): # Guard
        await send_ctx_reply(ctx, "You have been blocked by an admin")
        return
    print(args) # TODO: Validation
    result = manager.get_user_movie_by_title(ctx.author.name, args)
    if not result:
        await ctx.send("Couldn't find your movie. Upload it first.")
        return
    set_diff_store(result)
    
    # Clear data_store, except title
    data_store['title'] = result['title']
    await ctx.send("Update", view=construct_update_view(result, ctx.author))

@client.command()
async def my_movies(ctx : commands.Context):
    if blocklist_interaction_gurad(ctx.author.name): # Guard
        await send_ctx_reply(ctx, "You have been blocked by an admin")
        return
    r = await get_movies_of(ctx, ctx.author.name)
    await send_ctx_reply(ctx, '\n'.join(r))

@client.command()
async def movies_of(ctx : commands.Context, args):
    if blocklist_interaction_gurad(ctx.author.name): # Guard
        await send_ctx_reply(ctx, "You have been blocked by an admin")
        return
    r = await get_movies_of(ctx, args)
    if None in r: 
        await ctx.defer() # Response sent out in handler
    elif r == []: 
        await send_ctx_reply(ctx, "User has no movies yet.")
    else:
        await send_ctx_reply(ctx, '\n'.join(r))

@client.command()
async def delete_my_movie(ctx : commands.Context, args):
    if blocklist_interaction_gurad(ctx.author.name): # Guard
        await send_ctx_reply(ctx, "You have been blocked by an admin")
        return
    await delete_movie_of(ctx, ctx.author.name, args)

@client.command()
async def delete_my_movies(ctx : commands.Context):
    if blocklist_interaction_gurad(ctx.author.name): # Guard
        await send_ctx_reply(ctx, "You have been blocked by an admin")
        return
    await delete_movies_of(ctx.author.name)
    await send_ctx_reply(ctx, "Movie list deleted.")

@client.command()
async def spec_movies(ctx : commands.Context, args):
    if blocklist_interaction_gurad(ctx.author.name): # Guard
        await send_ctx_reply(ctx, "You have been blocked by an admin")
        return
    await get_movies_by_query(ctx, args)

@client.command()
async def hello(ctx : commands.Context):
    await ctx.send("H E L L O")


if __name__ == '__main__':
    manager = db_manager.DBManager()
    BOT_ACCESS_BLOCKED = [user['name'] for user in manager.blocklist_get_current()]
    manager.on_blocklist_changed += handle_blocklist_change
    client.run(access_token)

