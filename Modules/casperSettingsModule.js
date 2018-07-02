var require = patchRequire(require);

exports.casperSettings = {
    verbose: true,                  // log messages will be printed out to the console
    //logLevel: 'debug',
    pageSettings: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
    },
    waitTimeout: 10,
    viewportSize : { width: 1024, height: 800 }
} 