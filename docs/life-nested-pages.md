# Life nested page architecture

Each Life room now owns its own nested page set. The visible room tabs are navigation, not decorative labels. Each page preserves the room identity while changing the spatial composition, central physical metaphor, modules, and contextual rail.

Home: Home, Rooms, Routines, Maintenance, Inventory, Design.
Body: Body, Mind, Energy, Recovery.
Beauty: Today, Skin, Hair, Makeup, Body, Fragrance.
Closet: Wardrobe, Outfits, Occasions, Favorites, History.
Food: Food, Meals, Recipes, Pantry, Groceries.
Money: Money, Accounts, Spending, Saving, Plan.
Work: Today, This Week, Projects, Career, Ideas.
Relationships: People, Conversations, Memories, Plans, Boundaries.
Travel: Travel, Trips, Map, Packing, Memories.

Nested pages use `/life?room=<room>&view=<view>` so the Life region, connected data count, Glow Current, and room context remain continuous while each subpage has its own page state and architecture.
