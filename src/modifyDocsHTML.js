var cheerio = require('cheerio');
var fs = require('fs');
var config = require('./config');
var inputBaseDir = __dirname + '/../Contents/Resources/Documents/' + config.name;
var outputBaseDir = __dirname + '/../dist/' + config.name;
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

function modifiyHtml($) {
    var headerClasses = config.pageSubHeaders.toString();
    var $headers = $(headerClasses);

    // Clean versions link
    $('header a:nth-child(2)', '.headerWrapper').attr('href', 'javascript:void(0)');

    // Remove "Edit this Page" Button
    $('.edit-page-link').remove();

    // Remove langs navi
    $('span', '.nav-site').remove();

    // Remove page navi
    $('.onPageNav').remove();
    $('#tocToggler').remove();

    // Remove Header
    $('.fixedHeaderContainer').attr('style', 'display: none;');
    // // Remove Side Navigation
    // $('.docsNavContainer').remove();
    // // Remove Footer
    // $('.nav-footer').remove();
    // Clean up size of page
    $('.navPusher').attr('style', 'padding-top: 0;');
    $('head').append(`<style type="text/css">@media only screen and (min-width: 1024px) { .docsNavContainer {height:100vh;top: 0;} }</style>`);
    // $('.sideNavVisible').attr('style', 'min-width:inherit;padding-top:0');
    // $('.docMainWrapper').attr('style', 'width:inherit;');
    // $('.post').attr('style', 'float:none;margin:auto;');
}

function fixLink($, basePath) {
    // Fix links, see https://github.com/chinesedfan/jest-dash/issues/2
    $('a').each(function(index, elem) {
        var el = $(elem);
        var link = el.attr('href');
        if (link && link.indexOf('https://jestjs.io/docs/en/') === 0) {
            link = link.replace(/^https:\/\/jestjs\.io\/docs\/en\/([^#]+)(#[^#]*)?$/, function(a, path, anchor) {
                var newLink = basePath + path;
                if (path.indexOf('.html') < 0) newLink += '.html';
                if (anchor) newLink += anchor;
                return newLink;
            });
            el.attr('href', link);
        }
    });
}

// similar changes for root files
['en', 'index', 'help', 'en/help'].forEach(function(filename) {
    var commonPath = '/' + filename + '.html';
    var src = fs.readFileSync(inputBaseDir + commonPath, 'utf8');
    var $ = cheerio.load(src);
    modifiyHtml($);

    var basePath = 'docs/en/';
    if (filename.indexOf('/') >= 0) basePath = '../' + basePath; // FIXME: hard codes
    fixLink($, basePath);

    fs.writeFileSync(outputBaseDir + commonPath, $.html(), 'utf8');
    console.log(`Done ${commonPath}...`);
});

// remove the left column and the nav bar so that it fits dash's usually small
// browser screen
indexedFiles.forEach(function(array, index) {
    var commonPath = '/docs/en/' + array.filename + '.html';

    var src = fs.readFileSync(inputBaseDir + commonPath, 'utf8');
    var $ = cheerio.load(src);

    $(config.pageSubHeaders.toString()).each(function(index, elem) {
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

    modifiyHtml($);
    fixLink($, '');

    fs.writeFileSync(outputBaseDir + commonPath, $.html(), 'utf8');
    console.log(`Done ${commonPath}...`);
});

fs.writeFileSync(__dirname + '/../dist/anchorList.js', `module.exports=${JSON.stringify(anchorList, null, 4)};`, 'utf8');

console.log('...modifyDocsHTML done!');
