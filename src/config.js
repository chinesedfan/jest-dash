var config = {
    "name" : "jest",
    // createSectionJSON.js
    "index" : "getting-started.html",
    "sectionClass" : "navGroup", // left menu, section
    "headerTag" : "h3",          // left menu, section header
    "ignoreSection" : {
        "sectionsArray" : []
    },
    "ignorePage" : {
        "pagesArray" : []
    },
    // modifyDoscHTML.js
    "pageSubHeaders" : ["article h2"],    // content, sub header
    "pageThirdHeaders": ["article h3"],   // content, table of content anchor
    // getData.js
    "pageHeader" : "header h1",  // content, header
}

module.exports = config;
