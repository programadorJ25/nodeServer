// additionalMessage.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig"); // Importa la instancia de Sequelize

const AdditionalMessage = sequelize.define("PumpLead", {
  plcId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  chunk: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = AdditionalMessage;
