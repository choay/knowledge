const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cursus = sequelize.define('Cursus', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prix: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    themeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Themes', // Ensure this matches the actual Themes table
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  });

  return Cursus;
};
