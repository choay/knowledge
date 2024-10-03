const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Certificate = sequelize.define('Certificate', {
    issuedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Assurez-vous que cela est correct
        key: 'id',
      },
      allowNull: true,
    },
    cursusId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Cursus', // Change to string reference
        key: 'id',
      },
      allowNull: true,
    },
  }, {
    tableName: 'certificates',
    timestamps: false,
  });

  return Certificate;
};
