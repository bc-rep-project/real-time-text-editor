const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'real-time-text-editor',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

