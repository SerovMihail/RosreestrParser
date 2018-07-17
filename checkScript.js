// Modules
var fs = require('fs');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// Casper settings
var casper = require('casper').create({
    verbose: true,                  // log messages will be printed out to the console
    //logLevel: 'debug',
    pageSettings: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
    },
    onWaitTimeout: function () {
        saveAnError("Ошибка по таймауту");
    }
});
casper.options.waitTimeout = 120000;
casper.options.viewportSize = { width: 1024, height: 800 };

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

/** error handlers */
casper.on('error', function (msg, backtrace) {
    saveAnError('Непредвиденная ошибка', msg);
});

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


var folders = require('./Modules/foldersModule').getFolders();

var searchData = require('./Modules/argsCheckModule').getArgs(casper);

var vars = require('./Modules/varsModule').getVars();

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

newRecordIntoLog(searchData);


casper.start('https://rosreestr.ru/site/');

// Открываем сайт, переходим по ссылке на личный кабинет
casper.waitForSelector('#page_header', function () {
    //casper.capture('screenshots/' + vars.counter++ + '.png');
    this.mouse.click('a[href$="https://rosreestr.ru/wps/portal/p/PrivateOffice"]');
    //casper.capture('screenshots/' + vars.counter++ + '.png');
});

// Ждём все редиректы и заполняем данные.
casper.waitForUrl("https://esia.gosuslugi.ru/idp/rlogin?cc=bp", function () {
    casper.waitForSelector('.login-slils-box', function () {

        casper.evaluate(function authEvaluate() {
            $('#mobileOrEmail').val("89114017109").change();
            $('#password').val("12de12de").change();

            document.querySelector('.ui-button').click();
        });

    });

});

// Выбираем исполнителя по имени
casper.waitForSelector('.datalist-wrap', function () {

    casper.evaluate(function () {
        //$("div:contains('Парсамян Ирэн Арутюновна ')").click();
        $("table.not-hover tr:first-child").click(); //Парсамян Ирэн Арутюновна
        //$("table.not-hover tr:last-child").click()
    });

    takeDebugScreenShot('выбираем исполнителя по имени', vars.counter++);
});

// Идём в "Мои ключи"
casper.waitForSelector('.finances', function () {



    casper.evaluate(function () {
        $("div:contains('Мои ключи')").click();
    });

    takeDebugScreenShot('Идём в Мои ключи', vars.counter++);
});

// Запоминаем ключ
casper.waitForSelector('.kadastral-results-search', function () {

    vars.accessKey = casper.evaluate(function () {
        return document.querySelector('.right-column strong').innerHTML;
    });

    casper.evaluate(function () {
        $("a.logo").click();
    });

    takeDebugScreenShot('Запоминаем ключ', vars.counter++);
});


// Переходим на сайт реестра
casper.waitForSelector('.view-all', function () {

    casper.evaluate(function () {
        document.querySelector('.view-all').removeAttribute("target");
        document.querySelector('.view-all').click();
    });

    takeDebugScreenShot('Переходим на сайт реестра', vars.counter++);
});


// Переходим на "получение сведений ЕГРН"
casper.waitForSelector('.eservice_box', function () {

    casper.evaluate(function () {
        document.querySelector('a[href$="https://rosreestr.ru/wps/portal/p/cc_present/EGRN_1"]').click();
    });

    takeDebugScreenShot('Переходим на получение сведений ЕГРН', vars.counter++);
});

// Запрос посредством доступа к ФГИС ЕГРН
casper.waitForSelector('.menu-navigation-list', function () {

    casper.evaluate(function () {
        document.querySelector('a[href$="/wps/portal/p/cc_present/ir_egrn"]').click();
    });

    takeDebugScreenShot('Запрос к ФГИС ЕГРН', vars.counter++);
});


// заполняю ключ для доступа
casper.waitForSelector('.blockGrey', function () {

    var keyParts = vars.accessKey.split('-');

    casper.evaluate(function (val) {

        for (var i = 0; i < 5; i++) {
            document.querySelectorAll('.v-textfield')[i].value = val[i];
            $('.v-textfield').slice(i, i + 1).trigger("change");
        }

        document.querySelector('.v-button-wrap').click();

    }, keyParts);


    takeDebugScreenShot('Заполняю ключ для доступа', vars.counter++);

});

casper.wait(5000, function () {
    casper.evaluate(function () {
        document.querySelectorAll('.v-button-caption')[1].click();
    });
})

casper.wait(5000, function () {

    takeDebugScreenShot('После выбора поиска но до итерации', vars.counter++);
});

casper.waitForSelector('.v-textfield', function () {

    takeDebugScreenShot('Вкладка мои заявки появилась', vars.counter++);

    searchData.isReady = casper.evaluate(function (lastNumberOfRequest) {

        var result = [];
        var result1 = undefined;
        var result2 = undefined;

        var changeEvt = document.createEvent("HTMLEvents");
        changeEvt.initEvent("change", true, true);

        var filterField = document.querySelector('.v-textfield');
        var updateButton = document.querySelectorAll('span.v-button-caption')[5];
        
        filterField.value = lastNumberOfRequest;
        filterField.dispatchEvent(changeEvt);

        updateButton.click();

        result2 = waitForEl('.v-table-row, .v-table-row-odd', lastNumberOfRequest, function () {
            
            result1 = document.querySelector('.v-link').length;         
            result.push(result1);

            return result1;
        });
        
        result.push(result2);

        return result;
        

        function waitForEl(selector, currentValue, callback) {
            var rowLength = document.querySelectorAll(selector).length;
            var searchNumberText = document.querySelector('.v-table-row td:first-child div').innerText;
        
            if (rowLength == 1 && currentValue == searchNumberText) {
                callback();
            } else {
                setTimeout(function () {
                    waitForEl(selector, currentValue, callback);
                }, 100);
            }
        };



    }, searchData.lastNumberOfRequest);
});


casper.wait(5000, function () {

    console.log(JSON.stringify(searchData.isReady, "", 4));    

    takeDebugScreenShot('Finish', vars.counter++);
});


casper.run();

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


/** FUNCTIONS */


function saveAnError(errorText, message) {

    if (vars.env === "DEBUG")
        takeErrorScreenShot(errorText, vars.counter++);

    logMessage(errorText + message);

    handleError(errorText);
}

function newRecordIntoLog(searchData) {

    var twoLine = " \n ------------------------------ \n";
    var fullInfo = "Check this last number of request -> " + searchData.lastNumberOfRequest;
    var text = "\n\n" + twoLine + new Date().toLocaleString("ru") + "\n" + fullInfo + twoLine;

    fs.write(folders.baseDir + folders.logFile, text, "a");
}

// Сохраняем максимум информации. Проблема + месадж + время
function logMessage(text) {

    var errorTime = new Date().toLocaleString("ru");

    fs.write(folders.baseDir + folders.logFile, text + " " + errorTime + "\n", "a");
}

// сохраняем только порядковый номер
function takeErrorScreenShot(screenShotName, counter) {

    var screenShotName = folders.ErrorFolder + screenShotName + " " + counter + '.png';
    casper.capture(screenShotName);

    //console.log('screenShotName', screenShotName);
}

function takeDebugScreenShot(text, counter) {

    var screenShotName = folders.DebugFolder + counter + " " + text + '.png'; //folders.baseDir +      
    casper.capture(screenShotName);
    //console.log('screenShotName', screenShotName);
}

function afterReloadAuth() {

    takeDebugScreenShot('start in afterReloadAuth', vars.counter++);

    casper.evaluate(function () {
        location.reload();
    });

    takeDebugScreenShot('after reload', vars.counter++);

    casper.waitForSelector('.blockGrey', function () {

        casper.wait(5000, function () {

            takeDebugScreenShot('greyBlockExist', vars.counter++);

            var keyParts = vars.accessKey.split('-');

            casper.evaluate(function (val) {

                for (var i = 0; i < 5; i++) {
                    document.querySelectorAll('.v-textfield')[i].value = val[i];
                    $('.v-textfield').slice(i, i + 1).trigger("change");
                }

                document.querySelector('.v-button-wrap').click();

            }, keyParts);



            casper.wait(5000, function () {

                takeDebugScreenShot('keyWriten and accepted', vars.counter++);

                casper.evaluate(function () {
                    document.querySelector('.v-button-caption').click();
                });

                takeDebugScreenShot('AFTER another time', vars.counter++);

                casper.then(iterateCadastralArray);
            });
        });

    }, function () {
        takeDebugScreenShot('cant find grey block after error', vars.counter++);

        addBadResponseToResults();

        console.log(JSON.stringify(vars.tableRows, "", 4));

        logMessage(JSON.stringify(vars.cadastralArray, "", 4));
        logMessage(JSON.stringify(vars.tableRows, "", 4));

        casper.exit(1);
    });
}

function debugConsoleLog(text) {
    if (vars.env === "DEBUG")
        console.log(text);
}

function debugConsoleLogStringify(text) {
    if (vars.env === "DEBUG")
        console.log(JSON.stringify(text, "", 4));
}

function handleError(errorText) {

    // Если долгая загрузка, то пытаемся реанимировать
    if (errorText === "Ошибка по таймауту" && vars.currentCadastralIndex !== 0) {

        casper.evaluate(function () {
            $('.v-Notification').click();
        });

        casper.wait(5000, function () {
            afterReloadAuth();
        });

    } else {
        obj = {};

        if (errorText === "Ошибка по таймауту") {
            obj.message = "Ошибка произошла на этапе аунтентификации. Перезагрузите задачу.";
        }

        if (errorText === "Непредвиденная ошибка") {
            obj.message = "Произошла непредвиденная ошибка. Перезагрузите задачу.";
        }

        if (errorText === "Не найдены помещения") {
            obj.message = "Не найдены помещения. Перезагрузите задачу.";
        }

        console.log(JSON.stringify(obj, "", 4));

        casper.exit(1);
    }


}

function addBadResponseToResults() {

    if (vars.cadastralArray.length > vars.tableRows.length) {

        for (var i = vars.currentCadastralIndex; i < vars.cadastralArray.length; i++) {
            vars.tableRows.push({
                cadastralNumber: vars.cadastralArray[i],
                isLoaded: false
            });
        }
    }
}