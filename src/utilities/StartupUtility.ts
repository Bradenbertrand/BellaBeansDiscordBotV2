import { version, versionToArray } from "../commands/slashCommands/version";

import { MongoConnection } from "../services/MongoConnection";
import { Client, AttachmentBuilder } from 'discord.js';
import { PropertyDocument } from "../data/Property";
import { ImageMaker } from "../services/ImageMaker";
import { DiscordConnection } from "../services/DiscordConnection";
import { MonitorDocument } from "../data/Monitor";
import { startMonitor } from "../commands/slashCommands/monitor";


export class StartupUtility {
    /**
     * Check if Bella's major/minor numbers have changed
     */
    public static async isNotableUpdate(): Promise<boolean> {
        const mongoClient = await MongoConnection.getInstance();
        const mongoDb = mongoClient.db(process.env.MONGO_DB_NAME);
        
        const versionDocument: any = await mongoDb.collection("properties").findOne({ key: "version" });
        const versionItem: PropertyDocument = {
            key: versionDocument.key,
            value: versionDocument.value
        };

        const versionComponents = versionToArray(version);
        const cachedVersionComponents = versionToArray(versionItem.value);


        // only want to notify of major or feature changes
        const isBugFix: boolean = versionComponents[0] != cachedVersionComponents[0] || versionComponents[1] != cachedVersionComponents[1];
        return isBugFix;
    }

    /**
     * update the database to reflect bella's current
     */
    public static async updateVersion(){
        const mongoClient = await MongoConnection.getInstance();
        const mongoDb = mongoClient.db(process.env.MONGO_DB_NAME);
        await mongoDb.collection("properties").updateOne({key: "version"}, {$set:{value: version}} );
    }

    // TODO: make a singleton for the discord client like mongo client
    /**
     * Notify servers that bella is online with an image showing her version
     */
    public static async notifyServersOfBella(){
        const discordClient = await DiscordConnection.getInstance();
        discordClient.guilds.cache.forEach(guild => {
            ImageMaker.getVersionImage().then(imageBuffer => {
                let attachmentBuilder = new AttachmentBuilder(imageBuffer);
                guild.systemChannel?.send({files: [attachmentBuilder.attachment]});
            })
        })    
    }

    public static async restartMonitors(){
        const mongoClient = await MongoConnection.getInstance();
        const mongoDb = mongoClient.db(process.env.MONGO_DB_NAME);

        const monitors = mongoDb.collection("monitors").find();
        for await (let monitor of monitors){
            monitor = monitor as MonitorDocument;
            startMonitor(monitor._id, monitor.cronSchedule, monitor.options);
        }
    }
}