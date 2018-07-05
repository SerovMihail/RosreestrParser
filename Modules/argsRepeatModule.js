var require = patchRequire(require);

exports.getArgs = function (casper) {

    var searchData = {
        cadastralNumbers: casper.cli.args,
        region: ""
    };   

    if (casper.cli.has("region") && casper.cli.get("region")) {
        //console.log('\t- search by "region"');
        searchData.region = casper.cli.get("region").replace("/", " ");
        
    }
    
    return searchData;
}