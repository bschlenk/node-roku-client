const Fs = require('fs')

const XmlFiles = [
  { name: 'AppsXML', location: './helpers/apps.xml' },
  { name: 'ActiveAppXML', location: './helpers/active-app.xml' },
  { name: 'InfoXML', location: './helpers/info.xml' },
  { name: 'NetflixIcon', location: './helpers/netflix.jpeg' },
]

module.exports = XmlFiles.reduce((module, file) => {
  module[file.name] = Fs.readFileSync(file.location)
  return module
}, {})