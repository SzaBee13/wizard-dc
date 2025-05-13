const mongoose = require("mongoose");

const warnSchema = new mongoose.Schema({
    guildID: String,
    userID: String,
    warnings: [
        {
            moderatorID: String,
            reason: String,
            date: Date
        }
    ]
});

module.exports = mongoose.model("Warn", warnSchema);
