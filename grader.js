#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT="http://obscure-crag-1441.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var buildResponse = function(cks)
{
 var rp = function(result, response)
   {
    if(result instanceof Error) { console.error('Error:' + util.format(response.message)); return ""; }
     else  {
            $= cheerio.load(result);
            var checks = loadChecks(cks).sort();
            var out = {};
  	   for(var i in checks)
              {
               var present = $(checks[i]).length > 0;
               out[checks[i]]=present;
              }
            console.log(out);
	   }
   }
 return rp;
}

var assertURL=function(urlini)
{
 return urlini; 
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlUrl = function(urlfile, checksfile)
{
  console.log('retrieve data from ' + urlfile)
  rest.get(urlfile).on('complete', buildResponse(checksfile));
}


var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) 
   {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), null)
        .option('-u, --url <path>','url to index.html', clone(assertURL), null)
        .parse(process.argv);
    var checkJson = '';
    if(program.file) 
	{
	  console.log('Check local file ' + program.file); 
    	  checkJson = checkHtmlFile(program.file, program.checks);
	}
    else
	{
         console.log('Check remote url '+ program.url );
         checkJson = checkHtmlUrl(program.url, program.checks);
	}
    
    
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
   }
 else 
  {
    exports.checkHtmlFile = checkHtmlFile;
  }
