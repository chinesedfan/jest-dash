# clean up previous remains, if any
rm -rf Contents/Resources
rm -rf Jest.docset
rm -rf dist
mkdir -p Contents/Resources/Documents

# create a fresh sqlite db
cd Contents/Resources
sqlite3 docSet.dsidx 'CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT)'
sqlite3 docSet.dsidx 'CREATE UNIQUE INDEX anchor ON searchIndex (name, type, path)'

# fetch the whole doc site
cd Documents
wget -m -p -E -k -np -t 3 -T 10  \
  --reject-regex '/es-ES|/ja|/pt-BR|/ro|/ru|/uk|/zh-Hans|versions' \
  https://jestjs.io/

# move it around a bit
mv jestjs.io ./
rm -rf jestjs.io
cd ../../../

# create data file from base index page
mkdir dist
node src/createSectionJSON.js

# change the documentation markup layout a bit to fit dash's small window
mkdir -p dist/jest/docs/en
node src/modifyDocsHTML.js

# read the previously fetched doc site and parse it into sqlite
node src/index.js

# bundle up!
mkdir Jest.docset
cp -r Contents Jest.docset
cp -r dist/jest Jest.docSet/Contents/Resources/Documents/
cp src/icon* Jest.docset

# Create gzip bundle for Dash Contribution
tar --exclude='.DS_Store' -cvzf Jest.tgz Jest.docset
