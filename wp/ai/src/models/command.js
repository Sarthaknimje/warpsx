/**
 * Command model for handling user commands
 */
class Command {
  constructor(type, data = {}) {
    this.type = type;
    this.data = data;
  }
}

module.exports = { Command }; 