
'use strict';

module.exports = {
  log: log => {
    process.stdout.write('superagent call', log);
  }
};
