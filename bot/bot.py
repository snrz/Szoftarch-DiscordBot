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

''' Placeholder for data entry '''
data_store = {
    'title':    None,
    'genre':    None,
    'rating':   None,
    'agegroup': None,
    'audience': None
}

async def save_field_value(interaction : discord.Interaction, value, field_type : str):
    data_store[field_type] = value
    print (data_store)
    if all(item != None for item in data_store.values()):
        print("Store FULL")
        await interaction.response.defer()
        await interaction.followup.send("Ready to submit", view=ButtonView())
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
    def __init__(self):
        super().__init__()

    @discord.ui.select(
        options = [], # Generated at runtime
        min_values=1,
        max_values=1,
        placeholder="Select Movie Title"
    )
    async def title_callback(self, interaction : discord.Interaction, select : discord.ui.Select):
        print (f"Title picker selection: {select.values[0]}")
        await save_field_value(interaction, select.values[0], 'title')
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
        print (f"Genre picker selection: {select.values[0]}")
        await save_field_value(interaction, select.values[0], 'genre')
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
        print(f"Rating provided: {select.values[0]}")
        await save_field_value(interaction, select.values[0], 'rating')
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
        print(f"Age-group: {select.values[0]}")
        await save_field_value(interaction, select.values[0], 'agegroup')
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
        print(f"Recommended Audience: {select.values[0]}")
        await save_field_value(interaction, select.values[0], 'audience')
        #await interaction.response.defer()


class ButtonView(ui.View):
    def __init__(self):
        super().__init__()

    @discord.ui.button(
        label="Submit",
        style=discord.ButtonStyle.blurple
    )
    async def on_submit_press(self, interaction : discord.Interaction, button):
        await interaction.response.send_message(f"Input fields ready")
        manager.write_obj_to_collection({**data_store, **{'user': f"{interaction.user.name}"}})

    @discord.ui.button(
        label="Clear",
        style=discord.ButtonStyle.danger
    )
    async def on_clear_press(self, interaction : discord.Interaction, button):
        for key in data_store:
            data_store[key] = None
        await interaction.response.send_modal(MovieForm())
    

class MovieForm(ui.Modal, title='Questionnaire Response'):

    def __init__(self):
        super().__init__()
        print("Modal Init")

    name = ui.TextInput(label='Movie Title')
    components = [name]
    async def on_submit(self, interaction: discord.Interaction):
        print(f"@QueryMatch: {self.name}")
        
        await interaction.response.defer()

        filtering_routine = get_items_by_title(imdb_file, self.name)
        filtered_list = await filtering_routine

        display_me = ModularView()
        # Generate suggestions for title select
        display_me.children[0].options=[ discord.SelectOption(label=f"{item}") for item in filtered_list ]

        #TODO: Investigate ephemeral behaviour
        await interaction.followup.send("Select Options:", view=display_me)


client = ClientClass()

@client.tree.command(name='toggle_test', guild=discord.Object(id=guild_id))
async def testmodal(interaction : discord.Interaction):
    await interaction.response.send_modal(MovieForm())

@client.command()
async def hello(ctx : commands.Context):
    await ctx.send("H E L L O")


if __name__ == '__main__':
    manager = db_manager.DBManager()
    client.run(access_token)

