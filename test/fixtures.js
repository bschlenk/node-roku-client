const Fs = require('fs')

const XmlFiles = [
  { name: 'AppsXML', location: './helpers/apps.xml' },
  { name: 'ActiveApp', location: './helpers/active-app.xml' },
]

module.exports = XmlFiles.reduce((module, file) => {
  module[file.name] = Fs.readFileSync(file.location)
  return module
}, {})