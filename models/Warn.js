// models/Warn.js
const mongoose = require("mongoose");

const warnSchema = new mongoose.Schema({
    guildID: String,
    userID: String,
    warnings: [
        {
            moderatorID: String,
            action: String,
            duration: String,
            modMessage: String,
            date: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("Warn", warnSchema);
