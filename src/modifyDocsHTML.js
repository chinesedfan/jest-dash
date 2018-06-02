var cheerio = require('cheerio');
var fs = require('fs');
var config = require('./config');
var indexedFiles = require('../dist/indexedFiles');
var anchorList = [];

function addDashAnchor(el, type) {
    var name = el.text();
    el.prepend('<a name="//apple_ref/cpp/' + type + '/' + encodeURIComponent(name) + '" class="dashAnchor"></a>');

    if (type != 'Section') {
        var anchorName = el.children('.hash-link').first().attr('href');
        anchorList.push({
            name,
            type,
            path: config.name + '/docs/en/' + anchorName
        });
    }
}

// remove the left column and the nav bar so that it fits dash's usually small
// browser screen
indexedFiles.forEach(function(array, index) {
    var inputBaseDir = __dirname + '/../Contents/Resources/Documents/' + config.name;
    var outputBaseDir = __dirname + '/../dist/' + config.name;
    var commonPath = '/docs/en/' + array.filename + '.html';

    var src = fs.readFileSync(inputBaseDir + commonPath, 'utf8');
    var $ = cheerio.load(src);

    var headerClasses = config.pageSubHeaders.toString();
    var $headers = $(headerClasses);

    $(config.pageSubHeaders.toString()).each(function(index, elem) {
        // Remove "Edit this Page" Button
        $('.edit-page-link').remove();

        addDashAnchor($(elem), 'Section');
    });

    $(config.pageThirdHeaders.toString()).each(function(index, elem) {
        var tocType = 'Section';
        if (array.type === 'Resource') {
            tocType = 'Method';

            // Determine from dist/indexedFiles.js
            if (['configuration', 'cli'].indexOf(array.filename) >= 0) {
                tocType = 'Option';
            }
        }
        addDashAnchor($(elem), tocType);
    });

    // Remove Header
    $('.fixedHeaderContainer').remove();
    // Remove Side Navigation
    $('.docsNavContainer').remove();
    // Remove Footer
    $('.nav-footer').remove();
    // Clean up size of page
    $('.sideNavVisible').attr('style', 'min-width:inherit;padding-top:0');
    $('.docMainWrapper').attr('style', 'width:inherit;');
    $('.post').attr('style', 'float:none;margin:auto;');

    fs.writeFileSync(outputBaseDir + commonPath, $.html(), 'utf8');
    console.log(`Done ${commonPath}...`);
});

fs.writeFileSync(__dirname + '/../dist/anchorList.js', `module.exports=${JSON.stringify(anchorList, null, 4)};`, 'utf8');

console.log('...modifyDocsHTML done!');
