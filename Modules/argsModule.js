var require = patchRequire(require);

exports.getArgs = function (casper) {


    var searchData = {};

    if (casper.cli.has("region") && casper.cli.get("region")) {
        //console.log('\t- search by "region"');
        searchData.region = casper.cli.get("region");
    }

    if (casper.cli.has("zone") && casper.cli.get("zone")) {
        //console.log('\t- search by "zone"');
        searchData.zone = casper.cli.get("zone");
    }

    if (casper.cli.has("street") && casper.cli.get("street") !== "") {
        //console.log('\t- search by "street"');
        searchData.street = casper.cli.get("street");
    }

    if (casper.cli.has("houseNumber") && casper.cli.get("houseNumber") !== "") {
        //console.log('\t- search by "houseNumber"');
        searchData.houseNumber = casper.cli.get("houseNumber");
    }

    // if (casper.cli.has("apartmentNumber") && casper.cli.get("apartmentNumber") !== "") {
    //     //console.log('in appartment number');
    //     searchData.apartmentNumber = casper.cli.get("apartmentNumber");
    // }

    if (casper.cli.has("building") && casper.cli.get("building") !== "") {
        //console.log('in appartment number');
        searchData.building = casper.cli.get("building");
    }

    clearSlashes(searchData);



    return searchData;
}

function clearSlashes(searchData) {
    for (var i in searchData) {
        if (typeof searchData[i] === 'string')
            searchData[i] = searchData[i].replace("/", " ");
    }
}