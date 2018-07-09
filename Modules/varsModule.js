var require = patchRequire(require);

exports.getVars = function () {

    return {
        counter: 1, // screenshot index variable
        currentCadastralIndex: 0,

        cadastralArray: [],
        tableRows: [],
        
        accessKey: undefined,              
        
        env: "DEBUG"  // "PROD"
    }
};