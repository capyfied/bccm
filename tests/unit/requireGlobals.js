// Util.generateUuid() requires access to "crypto" API which is not available by default in the testing environment.
// This code fixes that.
export default () => {
  if (!window.crypto) {
    const nodeCrypto = require('crypto');
    window.crypto = {
      getRandomValues: function (buffer) {
        return nodeCrypto.randomFillSync(buffer);
      }
    };
  }
}
