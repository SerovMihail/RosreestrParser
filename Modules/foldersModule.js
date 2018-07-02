var require = patchRequire(require);
var fs = require('fs');

exports.getFolders = function () {

    var currentFolder = fs.workingDirectory;
    var scriptName = currentFolder.split('/').pop().split('.')[0];
       
    var foldersData = {
        baseDir: currentFolder + "/",
        scriptName: scriptName,
        ErrorFolder: currentFolder +  "/" + scriptName + "Errors/",
        DebugFolder: currentFolder +  "/" + scriptName + "Debug/",
        logFile: scriptName + '.log'
    };
   
    clearFolders(foldersData);

    return foldersData;
};

function clearFolders(data) {

    fs.removeTree(data.ErrorFolder);
    fs.removeTree(data.DebugFolder);

}

// var timeFromCreated = undefined;
    // fs.stat('C:\\Users\\roskvartal-pc\\Desktop\\RosReestrProject\\1',
    //     function (err, stats) {
    //         timeFromCreated = stats.birthtime.getTime();
    //     });

    //     var weekInMs = 604800000;

    // console.log('timeCreated ' + timeFromCreated + '\n');
    // console.log('timeCreated + week ms' + (timeFromCreated + weekInMs ) + '\n');

    // if (timeFromCreated && (timeFromCreated + weekInMs) < new Date().getTime())
    //     fs.removeTree(toDeleteDebugFolder);
    //fs.removeTree(toDeleteErrorFolder);
    //fs.removeTree(toDeleteDebugFolder);