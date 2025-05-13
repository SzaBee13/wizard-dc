require("dotenv").config();
const {
    Client,
    Events,
    GatewayIntentBits,
    SlashCommandBuilder,
    ActivityType,
    PermissionsBitField,
    REST,
    Routes,
    Collection,
    PermissionFlagsBits,
} = require("discord.js");
const { token, clientId, guildId } = require("./config.json");
const Warn = require('./models.Warn.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const ALLOWED_ROLES_ADM = ["1136940263294636124", "1136940400385470534"];
const ALLOWED_ROLES_MA = [
    "1136940263294636124",
    "1136940400385470534",
    "1136940620221526097",
];
const MOD_CHANNEL_ID = "1136946054965755914";
const MUTE_ROLES = ["1139439366930964480", "1272819610567180413"];
let commandsP;

client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}`);

    client.user.setPresence({
        activities: [{ name: "Wizard Guru YT", type: ActivityType.Watching }],
        status: "dnd", // Elfoglalt státusz: dnd // Online státusz: online
    });

    const commands = [
        new SlashCommandBuilder()
            .setName("hello")
            .setDescription("Valakinek köszön")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("Kinek köszönjek?")
                    .setRequired(false)
            ),

        new SlashCommandBuilder()
            .setName("kick")
            .setDescription("Kirúgja a megadott felhasználót a szerverről")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("A felhasználó, akit kirúgsz")
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("Indoklás a kirúgáshoz")
                    .setRequired(false)
            ),

        new SlashCommandBuilder()
            .setName("ban")
            .setDescription("Kitiltja a megadott felhasználót a szerverről")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("A felhasználó, akit kitiltasz")
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("Indoklás a kitiltáshoz")
                    .setRequired(false)
            ),

        new SlashCommandBuilder()
            .setName("unban")
            .setDescription(
                "Feloldja a megadott felhasználó tiltását a szerveren"
            )
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription(
                        "A felhasználó azonosítója, akinek feloldod a tiltását"
                    )
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("Indoklás a tiltás feloldásához")
                    .setRequired(false)
            ),

        new SlashCommandBuilder()
            .setName("tempban")
            .setDescription(
                "Ideiglenesen kitiltja a megadott felhasználót egy adott időre"
            )
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription(
                        "A felhasználó, akit ideiglenesen kitiltasz"
                    )
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("duration")
                    .setDescription(
                        'Az időtartam, például "5d3h20m" (5 nap 3 óra 20 perc)'
                    )
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("Indoklás a kitiltáshoz")
                    .setRequired(false)
            ),

        new SlashCommandBuilder()
            .setName("mute")
            .setDescription("Mute-olja a felhasználót.")
            .addUserOption((option) =>
                option
                    .setName("target")
                    .setDescription("A felhasználó, akit mute-olni szeretnél")
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("Indok a felhasználó némítására")
                    .setRequired(false)
            ),

        new SlashCommandBuilder()
            .setName("unmute")
            .setDescription("Unmute-olja a felhasználót.")
            .addUserOption((option) =>
                option
                    .setName("target")
                    .setDescription("A felhasználó, akit unmute-olni szeretnél")
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("Indok a felhasználó vissza-némítására")
                    .setRequired(false)
            ),

        new SlashCommandBuilder()
            .setName("tempmute")
            .setDescription(
                "Ideiglenesen mute-olja a felhasználót egy adott időtartamra."
            )
            .addUserOption((option) =>
                option
                    .setName("target")
                    .setDescription(
                        "A felhasználó, akit ideiglenesen mute-olni szeretnél"
                    )
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName("duration")
                    .setDescription("Az időtartam órákban")
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("Indok a felhasználó némítására")
                    .setRequired(false)
            ),

        new SlashCommandBuilder()
            .setName("warn")
            .setDescription("Figyelmeztetést küld egy felhasználónak")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription(
                        "A felhasználó, akit figyelmeztetni szeretnél"
                    )
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("action")
                    .setDescription("A tervezett cselekvés (Mute, Kick, Ban)")
                    .setRequired(true)
                    .addChoices(
                        { name: "Mute", value: "Muteolva" },
                        { name: "Kick", value: "Kickelve" },
                        { name: "Ban", value: "Bannolva" }
                    )
            )
            .addStringOption((option) =>
                option
                    .setName("duration")
                    .setDescription(
                        'Az időtartam, például "5d3h20m" (5 nap 3 óra 20 perc)'
                    )
                    .setRequired(false)
            )
            .addStringOption((option) =>
                option
                    .setName("mod_message")
                    .setDescription("Üzenet a moderátoroknak")
                    .setRequired(false)
            ),

        new SlashCommandBuilder()
            .setName("test")
            .setDescription("Teszt hogy a bot online-e"),

        new SlashCommandBuilder()
            .setName("dm")
            .setDescription("A bot privát üzenetet küld valakinek")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("Feszhasználó akinek akarsz írni")
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("text")
                    .setDescription("Szöveg amit el akarsz küldeni")
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName("send")
            .setDescription("Üzenet küldése bármelyik csatornára")
            .addStringOption((option) =>
                option
                    .setName("channel")
                    .setDescription("Csatorna ahova el akarod küldeni")
                    .setRequired(true)
                    .addChoices(
                        { name: "main", value: "1136939709394854020" },
                        { name: "ad", value: "1136945828423024781" },
                        { name: "staff", value: "1136946054965755914" },
                        { name: "this", value: "this" }
                    )
            )
            .addStringOption((opcion) =>
                opcion
                    .setName("text")
                    .setDescription("Az üzeneted")
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName("talk")
            .setDescription("Send a message to the AI and get a response.")
            .addStringOption((option) =>
                option
                    .setName("message")
                    .setDescription("The message you want to send to the AI")
                    .setRequired(true)
            ),
    ].map((command) => command.toJSON());
    client.application.commands.set(commands, guildId);

    commandsP = commands;
});

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");
        await rest.put(Routes.applicationCommands(clientId), {
            body: commandsP,
        });
        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error("Error refreshing application commands:", error);
    }
})();

// Amit csinál a bot (Fő kód)

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const member = interaction.member;
    const hasPermissionAdmin = member.roles.cache.some((role) =>
        ALLOWED_ROLES_ADM.includes(role.id)
    );
    const hasPermissionMA = member.roles.cache.some((role) =>
        ALLOWED_ROLES_MA.includes(role.id)
    );
    const hasPermissionOwner = member.roles.cache.some(
        (role) => role.id === "1136940263294636124"
    );
    const MOD_CHANNEL_ID = "1136946054965755914";
    const permisonC = "1139436670312255499";
    const rest = new REST({ version: "10" }).setToken(token);
    const { commandName, options } = interaction;

    if (commandName === "dm" || commandName === "send") {
        if (!hasPermissionOwner) {
            return interaction.reply({
                content: "Nincs jogosultságod a parancs használatához!",
                ephemeral: true,
            });
        }

        const text = options.getString("text");

        if (commandName === "dm") {
            const user = options.getUser("user");
            const userDM = await client.users.fetch(user.id);

            try {
                await userDM.send(text);
                interaction.reply({
                    content: `Sikeres üzenetküldés!`,
                    ephemeral: true,
                });
            } catch (error) {
                interaction.reply({
                    content: `Sikertelen üzenetküldés, próbálja újra!`,
                    ephemeral: true,
                });
            }
        } else if (commandName === "send") {
            const channelId = options.getString("channel");
            if (channelId === "this") {
                interaction.reply(text);
            }
            const channel = await interaction.client.channels.fetch(channelId);
            try {
                await channel.send(text);
                await interaction.reply({
                    content: "Sikeres üzenetküldés!",
                    ephemeral: true,
                });
            } catch (error) {
                await interaction.reply({
                    content: "Sikertelen üzenetküldés, próbálja újra!",
                    ephemeral: true,
                });
            }
        }
    }

    if (
        commandName === "ban" ||
        commandName === "unban" ||
        commandName === "tempban"
    ) {
        if (!hasPermissionAdmin) {
            return interaction.reply({
                content: "Nincs jogosultságod a parancs használatához!",
                ephemeral: true,
            });
        }

        const user = options.getUser("user");
        const reason = options.getString("reason") || "Nincs megadva indoklás";

        if (commandName === "ban") {
            try {
                await interaction.guild.members.ban(user.id, { reason });
                interaction.reply({
                    content: `${user.username} ki lett tiltva. Indoklás: ${reason}`,
                    ephemeral: true,
                });
            } catch (error) {
                interaction.reply({
                    content: "Hiba történt a felhasználó kitiltásakor.",
                    ephemeral: true,
                });
            }
        } else if (commandName === "unban") {
            try {
                await interaction.guild.members.unban(user.id, reason);
                interaction.reply({
                    content: `${user.username} tiltása feloldva. Indoklás: ${reason}`,
                    ephemeral: true,
                });
            } catch (error) {
                interaction.reply({
                    content:
                        "Hiba történt a felhasználó tiltásának feloldásakor.",
                    ephemeral: true,
                });
            }
        } else if (commandName === "tempban") {
            const durationStr = options.getString("duration");
            const durationMs = parseDuration(durationStr); // Assuming parseDuration is defined

            if (!durationMs) {
                return interaction.reply({
                    content:
                        'Hibás időtartam formátum! Használd a "XdYhZm" formátumot.',
                    ephemeral: true,
                });
            }

            try {
                await interaction.guild.members.ban(user.id, { reason });
                interaction.reply({
                    content: `${user.username} ki lett tiltva ${durationStr} időtartamra. Indoklás: ${reason}`,
                    ephemeral: true,
                });

                setTimeout(async () => {
                    try {
                        await interaction.guild.members.unban(
                            user.id,
                            "Tempban idő lejárt"
                        );
                        const invite = await interaction.guild.invites.create(
                            interaction.channel,
                            { maxAge: 86400, maxUses: 1 }
                        );
                        const userDM = await client.users.fetch(user.id);
                        await userDM.send(
                            `Tiltásod feloldva. Meghívód: ${invite.url}`
                        );
                    } catch (error) {
                        console.error(
                            `Nem sikerült feloldani a tiltást: ${error}`
                        );
                    }
                }, durationMs);
            } catch (error) {
                interaction.reply({
                    content: "Hiba történt a felhasználó kitiltásakor.",
                    ephemeral: true,
                });
            }
        }
    }

    // Kick, Mute, Unmute, Warn handling...

    if (
        commandName === "kick" ||
        commandName === "mute" ||
        commandName === "unmute" ||
        commandName === "tempmute" ||
        commandName === "warn"
    ) {
        if (!hasPermissionMA) {
            return interaction.reply({
                content: "Nincs jogosultságod a parancs használatához!",
                ephemeral: true,
            });
        }

        const user = options.getUser("user");
        const reason = options.getString("reason") || "Nincs megadva indoklás";

        if (commandName === "kick") {
            try {
                await interaction.guild.members.kick(user.id, reason);
                interaction.reply({
                    content: `${user.username} ki lett rúgva. Indoklás: ${reason}`,
                    ephemeral: true,
                });
            } catch (error) {
                interaction.reply({
                    content: "Hiba történt a felhasználó kirúgásakor.",
                    ephemeral: true,
                });
            }
        } else if (commandName === "mute") {
            try {
                const member = await interaction.guild.members.fetch(user.id);
                await member.roles.add(MUTE_ROLES);
                interaction.reply({
                    content: `${user.username} néma lett. Indoklás: ${reason}`,
                    ephemeral: true,
                });
            } catch (error) {
                interaction.reply({
                    content: "Hiba történt a felhasználó némítása közben.",
                    ephemeral: true,
                });
            }
        } else if (commandName === "unmute") {
            try {
                const member = await interaction.guild.members.fetch(user.id);
                await member.roles.remove(MUTE_ROLES);
                interaction.reply({
                    content: `${user.username} néma feloldva. Indoklás: ${reason}`,
                    ephemeral: true,
                });
            } catch (error) {
                interaction.reply({
                    content:
                        "Hiba történt a felhasználó némításának feloldásakor.",
                    ephemeral: true,
                });
            }
        } else if (commandName === "tempmute") {
            const durationStr = options.getString("duration");
            const durationMs = parseDuration(durationStr);

            if (!durationMs) {
                return interaction.reply({
                    content:
                        'Hibás időtartam formátum! Használd a "XdYhZm" formátumot.',
                    ephemeral: true,
                });
            }

            try {
                const member = await interaction.guild.members.fetch(user.id);
                await member.roles.add(MUTE_ROLES);
                interaction.reply({
                    content: `${user.username} néma lett ${durationStr} időtartamra. Indoklás: ${reason}`,
                    ephemeral: true,
                });

                setTimeout(async () => {
                    try {
                        await member.roles.remove(MUTE_ROLES);
                        interaction.channel.send(
                            `${user.username} némítása feloldva.`
                        );
                    } catch (error) {
                        console.error(
                            `Nem sikerült feloldani a némítást: ${error}`
                        );
                    }
                }, durationMs);
            } catch (error) {
                interaction.reply({
                    content: "Hiba történt a felhasználó némítása közben.",
                    ephemeral: true,
                });
            }
        } else if (commandName === "warn") {
            if (!hasPermissionMA) {
                return interaction.reply({
                    content: "Nincs jogosultságod a parancs használatához!",
                    ephemeral: true,
                });
            }

            const user = interaction.options.getUser("user");
            const action = interaction.options.getString("action"); // Muteolva, Kickelve, Bannolva
            const duration =
                interaction.options.getString("duration") || "Nincs megadva";
            const modMessage =
                interaction.options.getString("mod_message") ||
                "Nincs megjegyzés";

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.ModerateMembers
                )
            ) {
                return await interaction.reply({
                    content: "Nincs jogod figyelmeztetni tagokat!",
                    ephemeral: true,
                });
            }

            if (!user) {
                return await interaction.reply({
                    content: "A megadott felhasználó nem található.",
                    ephemeral: true,
                });
            }

            if (user.id === interaction.user.id) {
                return await interaction.reply({
                    content: "Nem figyelmeztetheted saját magad!",
                    ephemeral: true,
                });
            }

            await interaction.deferReply({ ephemeral: true });

            try {
                let warnings = await Warn.findOne({
                    guildID: interaction.guild.id,
                    userID: user.id,
                });

                if (!warnings) {
                    warnings = new Warn({
                        guildID: interaction.guild.id,
                        userID: user.id,
                        warnings: [],
                    });
                }

                const warningEntry = {
                    moderatorID: interaction.user.id,
                    action: action,
                    duration: duration,
                    modMessage: modMessage,
                    date: new Date(),
                };

                warnings.warnings.push(warningEntry);
                await warnings.save();

                const embed = new EmbedBuilder()
                    .setTitle("⚠️ Figyelmeztetés")
                    .setDescription(`${user.tag} figyelmeztetve lett!`)
                    .addFields(
                        { name: "Cselekvés", value: action, inline: true },
                        { name: "Időtartam", value: duration, inline: true },
                        { name: "Moderátor", value: interaction.user.tag },
                        { name: "Moderátori üzenet", value: modMessage }
                    )
                    .setColor("Yellow")
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [embed],
                });

                try {
                    await user.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("⚠️ Figyelmeztetés")
                                .setDescription(
                                    `Figyelmeztetve lettél a(z) ${action} miatt.`
                                )
                                .addFields(
                                    { name: "Időtartam", value: duration },
                                    {
                                        name: "Moderátori üzenet",
                                        value: modMessage,
                                    }
                                )
                                .setColor("Red")
                                .setTimestamp(),
                        ],
                    });
                } catch {
                    // Privát üzenet nem ment – nem dobunk hibát
                }
            } catch (err) {
                console.error("Hiba történt a figyelmeztetés során:", err);
                await interaction.editReply({
                    content: "Hiba történt a figyelmeztetés során.",
                });
            }
        }
    }

    if (commandName === "hello") {
        const user = options.getUser("user") || interaction.user;
        interaction.reply({
            content: `Szia, ${user.username}!`,
            ephemeral: true,
        });
    } else if (commandName === "talk") {
        const message = options.getString("message");
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });
        interaction.reply({
            content: response.data.choices[0].message.content,
            ephemeral: true,
        });
    }
    if (interaction.commandName === "test") {
        interaction.reply({ content: `Igen online vagyok`, ephemeral: true });
    }
});

function parseDuration(duration) {
    const regex = /^(\d+d)?(\d+h)?(\d+m)?$/;
    const matches = duration.match(regex);

    if (!matches) {
        throw new Error(
            'Invalid duration format. Please use the format "XdYhZm", where X, Y, and Z are numbers.'
        );
    }

    let totalMs = 0;

    if (matches[1]) {
        totalMs += parseInt(matches[1]) * 24 * 60 * 60 * 1000; // napok milliszekundumban
    }
    if (matches[2]) {
        totalMs += parseInt(matches[2]) * 60 * 60 * 1000; // órák milliszekundumban
    }
    if (matches[3]) {
        totalMs += parseInt(matches[3]) * 60 * 1000; // percek milliszekundumban
    }

    return totalMs;
}
client.login(token);
