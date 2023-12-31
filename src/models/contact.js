const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
const fs = require("fs");

const certificatePath = path.resolve(__dirname, "DigiCertGlobalRootCA.crt.pem");
const sequelize = new Sequelize(
  process.env.DBNAME,
  process.env.DBUSER,
  process.env.DBPASS,
  {
    host: process.env.DBHOST,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(certificatePath),
      },
    },
  }
);

const Contact = sequelize.define("Contact", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

try {
  sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

sequelize
  .sync()
  .then(() => {
    console.log("Tablas sincronizadas correctamente");
  })
  .catch((error) => {
    console.error("Error al sincronizar tablas:", error);
  });

module.exports = Contact;
