var require = patchRequire(require);

exports.getArgs = function (casper) {

    var searchData = {};

    if (casper.cli.has("lastNumberOfRequest") && casper.cli.get("lastNumberOfRequest")) {
        //console.log('\t- search by "lastNumberOfRequest"');
        searchData.lastNumberOfRequest = casper.cli.get("lastNumberOfRequest");
    }    

    return searchData;
}

