var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var config = require('./config');

// get base file to itterate over
var basePath = __dirname + '/../Contents/Resources/Documents/' + config.name + '/docs/en/' + config.index;
var baseSrc = fs.readFileSync(basePath, 'utf8');
var $ = cheerio.load(baseSrc);
var pageNamesArray = [];
var $section = $('.' + config.sectionClass);
var outputPath = __dirname + '/../dist/indexedFiles.js';

$section.each(function(i, elem){

    // TODO: create a better config pointer
    var sectionHeader = $(this).children(config.headerTag).text();
    var $sectionLink = $(this).children('ul').children('li').children('a');
    console.log(`Found section ${sectionHeader}...`);

    $sectionLink.each(function(i, elem){
        var page = {};

        if(config.ignoreSection.sectionsArray.indexOf(sectionHeader) !== -1) {
            return;
        }

        page.filename = path.basename($(this).attr('href'), '.html');
        page.name = $(this).text();
        page.path = config.name + '/docs/en/' + page.filename + '.html#_';

        if(config.ignorePage.pagesArray.indexOf(page.filename) !== -1) {
            return;
        }

        // set the Dash types based on the doc headers.
        switch (sectionHeader) {
            case 'Introduction':
                page.type = 'Instruction';
                break;
            case 'Guides':
                page.type = 'Guide';
                break;
            case 'Framework Guides':
                page.type = 'Framework';
                break;
            case 'API Reference':
                page.type = 'Resource';
                break;
            default:
                page.type = 'File'
        };
        pageNamesArray.push(page);
        console.log(`Found page ${page.name}...`);
    });
});

fs.writeFileSync(outputPath, 'var indexedFiles = ' + JSON.stringify(pageNamesArray, null, 4) + ';\n\nmodule.exports = indexedFiles;', 'utf8');
console.log('...indexedFiles.js generated!');
