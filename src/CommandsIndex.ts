import {Command} from "./utilities/Command";
import {decide} from "./commands/slashCommands/decide";

/**
 * This file will exist as an index for all of the commands, this is where they are imported
 * In order for a command to be registered, it must be imported and added to this map
 */
export const Commands: Map<string, Command> = new Map<string, Command>([
    [decide.getBuilder().name, decide]
]);
