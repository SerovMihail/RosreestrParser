var require = patchRequire(require);

exports.getVars = function () {


    return {
        counter: 1, // screenshot index variable
        accessKey: undefined,
        cadastralArray: [],
        currentCadastralIndex: 0,
        tableRows: []
    }
};