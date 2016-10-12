const Fs = require('fs')

const AppsXML = Fs.readFileSync('./helpers/apps.xml')

module.exports = {
  appsXML: AppsXML
}