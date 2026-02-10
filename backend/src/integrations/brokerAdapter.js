const { DemoBroker } = require('../brokers/DemoBroker');

const adapter = new DemoBroker();
module.exports = { adapter };
