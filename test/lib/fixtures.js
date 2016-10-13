const Fs = require('fs')

const XmlFiles = [
  { name: 'AppsXML', location: './resources/apps.xml' },
  { name: 'ActiveAppXML', location: './resources/active-app.xml' },
  { name: 'InfoXML', location: './resources/info.xml' },
  { name: 'NetflixIcon', location: './resources/netflix.jpeg' },
]

module.exports = XmlFiles.reduce((module, file) => {
  module[file.name] = Fs.readFileSync(file.location)
  return module
}, {})