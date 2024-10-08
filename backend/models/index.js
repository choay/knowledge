// models/index.js
const sequelize = require('../db');
const User = require('./user')(sequelize);
const Theme = require('./theme')(sequelize);
const Cursus = require('./cursus')(sequelize);
const Lesson = require('./lesson')(sequelize);
const Achat = require('./achat')(sequelize);
const Certificate = require('./certificate')(sequelize);
const Progress = require('./progress')(sequelize);

// Define associations
const defineAssociations = () => {
  try {
    // User - Achat Relationship
    User.hasMany(Achat, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Achat.belongsTo(User, { foreignKey: 'userId' });

    // User - Certificate Relationship
    User.hasMany(Certificate, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Certificate.belongsTo(User, { foreignKey: 'userId' });

    // Cursus - Lesson Relationship
    Cursus.hasMany(Lesson, { foreignKey: 'cursusId', as: 'lessons' });
    Lesson.belongsTo(Cursus, { foreignKey: 'cursusId' });

    // Cursus - Achat Relationship
    Cursus.hasMany(Achat, { foreignKey: 'cursusId', onDelete: 'CASCADE' });
    Achat.belongsTo(Cursus, { foreignKey: 'cursusId' });

    // Lesson - Achat Relationship
    Lesson.hasMany(Achat, { foreignKey: 'lessonId', onDelete: 'CASCADE' });
    Achat.belongsTo(Lesson, { foreignKey: 'lessonId' });

    // Cursus - Certificate Relationship
    Cursus.hasMany(Certificate, { foreignKey: 'cursusId', onDelete: 'CASCADE' });
    Certificate.belongsTo(Cursus, { foreignKey: 'cursusId' });

    // User - Progress Relationship
    User.hasMany(Progress, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Progress.belongsTo(User, { foreignKey: 'userId' });

    // Lesson - Progress Relationship
    Lesson.hasMany(Progress, { foreignKey: 'lessonId', onDelete: 'CASCADE' });
    Progress.belongsTo(Lesson, { foreignKey: 'lessonId' });

    // Theme - Cursus Relationship
    Theme.hasMany(Cursus, { foreignKey: 'themeId', onDelete: 'CASCADE' });
    Cursus.belongsTo(Theme, { foreignKey: 'themeId' });
  } catch (error) {
    console.error('Error defining associations:', error);
  }
};

// Call the function to define associations
defineAssociations();

const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true }); // Update the database schema to match models
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing the database:', error);
  }
};

// Call the function to sync models
syncModels();

module.exports = {
  User,
  Theme,
  Cursus,
  Lesson,
  Achat,
  Certificate,
  Progress,
  syncModels,
};
