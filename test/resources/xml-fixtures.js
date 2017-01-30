const Fs = require('fs');
const Path = require('path');

const XmlFiles = [
  {name: 'AppsXML', location: './assets/apps.xml'},
  {name: 'ActiveAppXML', location: './assets/active-app.xml'},
  {name: 'InfoXML', location: './assets/info.xml'},
  {name: 'NetflixIcon', location: './assets/netflix.jpeg'}
];

module.exports = XmlFiles.reduce((module, file) => {
  module[file.name] = Fs.readFileSync(Path.join(__dirname, file.location));
  return module;
}, {});
