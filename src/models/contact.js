const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('contacts', 'imagine-cx', '123456789', {
  host: 'localhost',
  dialect: 'mysql',
});

const Contact = sequelize.define('Contact', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

const ContactData = sequelize.define('ContactData', {
  data: {
    type: DataTypes.JSON,
  },
});

try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

sequelize.sync()
  .then(() => {
    console.log('Tablas sincronizadas correctamente');
  })
  .catch((error) => {
    console.error('Error al sincronizar tablas:', error);
  });

module.exports = {Contact, ContactData};
