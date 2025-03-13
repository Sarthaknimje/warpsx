/**
 * Answer model for handling responses
 */
class Answer {
  constructor(text, data = {}) {
    this.text = text;
    this.data = data;
  }
}

module.exports = { Answer }; 