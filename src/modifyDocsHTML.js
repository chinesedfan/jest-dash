var cheerio = require('cheerio');
var fs = require('fs');
var config = require('./config');
var indexedFiles = require('../dist/indexedFiles');

// remove the left column and the nav bar so that it fits dash's usually small
// browser screen
indexedFiles.forEach(function(array, index) {
    var inputBaseDir = __dirname + '/../Contents/Resources/Documents/' + config.name;
    var outputBaseDir = __dirname + '/../dist/' + config.name;
    var commonPath = '/docs/en/' + array.name + '.html';

    var src = fs.readFileSync(inputBaseDir + commonPath, 'utf8');
    var $ = cheerio.load(src);

    var headerClasses = config.pageSubHeaders.toString();
    var $headers = $(headerClasses);

    $headers.each(function(index, elem) {
        // Remove "Edit this Page" Button
        $('.edit-page-link').remove();

        var name = $(elem).text();

        // TODO: Change "array.toc to somehting more relevant on a page-by-page basis in indexedFiles.js"
        $(elem).prepend('<a name="//apple_ref/cpp/' + array.toc + '/' + encodeURIComponent(name) + '" class="dashAnchor"></a>');
        $.html();
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
console.log('...modifyDocsHTML done!');
