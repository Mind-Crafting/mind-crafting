# Software Requirements

## Vision

We want to create a text-based environment in which users can play various minigames through the game Minecraft. 

The purpose of the project is entertainment.

Our project links several interesting technonlogies together such as Minecraft, Slack, AWS, etc.



## Scope

### IN

Our project will let users create minecraft bots associated to their Slack user ids. 

User can view what they are doing in-game inside of a web browser.

Users can view their stats for games and the stats of other users.

### Out

Users will not be able to view their Minecraft experience within Slack.

Users will not be able to create multiple bots at a time.

Users cannot log in to the Minecraft server directly using the Minecraft client.

### MVP

Using Slack as a text-based input, players can play a maze map.

### Stretch

More minigames. E.g. PvP, Puzzle maps, Spleef, a game in which players try to dig the ground out from underneath their opponent. 



# Functional Requirements

Users sign up and log in using only Slack, no additional auth required.

They can view their profile info which consists of statistics for each game mode.



# Non-Functional Requirements

### Usability

Our product depends on a remote AWS machine. Users would not have access to our games if this were to go down.

### Reliability

Our product can indicate whether or not the relevant servers are operational. Operational includes the latency not being too high since this would interfere with users' play.

### Data Flow

User data is entered into our `users` table initially. When the user starts a game, a boolean called `in_game` is set to `true`. Once the user completes a game, the relevant data is stored in our `stats` table and `in_game` is reset to `false`. 
