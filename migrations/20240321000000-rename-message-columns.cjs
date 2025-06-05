'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First rename messageCount to message_count
    await queryInterface.renameColumn('users', 'messageCount', 'message_count');
    
    // Then rename lastMessageDate to last_message_date
    await queryInterface.renameColumn('users', 'lastMessageDate', 'last_message_date');
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes if needed
    await queryInterface.renameColumn('users', 'message_count', 'messageCount');
    await queryInterface.renameColumn('users', 'last_message_date', 'lastMessageDate');
  }
}; 