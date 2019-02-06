var indexedFiles = require('../dist/indexedFiles');
var anchorList = require('../dist/anchorList');

// this assumes build.sh has been run, and the jest docs fetched into
// Contents/Resources/Documents/jest
function getData() {
  return indexedFiles.concat(anchorList);
}

module.exports = getData;
