// Require the necessary discord.js classes
import { BaseInteraction, Client, Events, GatewayIntentBits } from 'discord.js';
import { CommandHelper } from './utilities/CommandHelper';
require("dotenv").config();
// deploy commands anew
CommandHelper.deployCommands();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (once https://tinyurl.com/5cavyafu)
client.once(Events.ClientReady, client => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
});

// Log in to Discord with bot's client token
client.login(process.env.BOT_TOKEN);

// Parse interactions
client.on(Events.InteractionCreate, async (interaction: BaseInteraction) => {
	if(interaction.isCommand()){
		CommandHelper.handleCommand(interaction);
	}
});

