'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.createTable('users',{
      id:Sequelize.INTEGER NOT NULL PRIMARY KEY,
      firstName:Sequelize.STRING,
      lastName:Sequelize.STRING,
      email:Sequelize.STRING,
      password:Sequelize.STRING,
      address:Sequelize.STRING,
      city:Sequelize.STRING,
      state:Sequelize.STRING,
      zipCode:Sequelize.STRING,
      phone:Sequelize.STRING,
      status:Sequelize.INTEGER
    });

  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
