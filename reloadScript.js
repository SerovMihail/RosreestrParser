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

var searchData = require('./Modules/argsRepeatModule').getArgs(casper);

var vars = require('./Modules/varsModule').getVars();

vars.cadastralArray = searchData.cadastralNumbers;

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
        document.querySelector('.v-button-caption').click();
    });
})

casper.wait(5000, function () {

    takeDebugScreenShot('После выбора поиска но до итерации', vars.counter++);

    casper.then(iterateCadastralArray);
});


casper.wait(5000, function () {


    console.log(JSON.stringify(vars.tableRows, "", 4));

    logMessage(JSON.stringify(vars.cadastralArray, "", 4));
    logMessage(JSON.stringify(vars.tableRows, "", 4));

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
    var fullInfo = "region: " + searchData.region + "\nCadastralArray from arguments -> " + searchData.cadastralNumbers.join(' ');
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


function iterateCadastralArray() {

    //logMessage('new iterate cadastral');

    // Выбираю "Поиск объектов недвижимости"
    //casper.waitForSelector('.navigationPanel', function () {
    //casper.wait(7000, function () {

    //console.log('navigationPanek');
    // casper.evaluate(function () {
    //     document.querySelector('.v-button-caption').click();
    // });

    //casper.waitForSelector('.v-filterselect-button', function () {
    //casper.wait(15000, function () {
    casper.waitForSelector('.v-embedded', function () {

        takeDebugScreenShot('До заполнения данных', vars.counter++);

        logMessage('\nСadastral number: ' + vars.currentCadastralIndex + ' | Index: ' + vars.cadastralArray[vars.currentCadastralIndex]);

        if (!vars.cadastralArray[vars.currentCadastralIndex]) {
            takeDebugScreenShot('По данному помещению не найден кадастровый номер', vars.counter++);
            logMessage('\nПо данному помещению не найден кадастровый номер ' + '| Номер -> ' + vars.cadastralArray[vars.currentCadastralIndex]);

            var row = {};
            row.number = vars.currentCadastralIndex + 1;
            row.cadastralNumber = "Не имеет кадастрового номера";    
            row.isLoaded = false;
            vars.tableRows = vars.tableRows.concat(row);

            vars.currentCadastralIndex++;

            if (vars.currentCadastralIndex < vars.cadastralArray.length) {

                casper.then(iterateCadastralArray);

            } else {
                console.log(JSON.stringify(vars.tableRows, "", 4));

                logMessage(JSON.stringify(vars.cadastralArray, "", 4));
                logMessage(JSON.stringify(vars.tableRows, "", 4));

                casper.exit(1);
            }
        }

        casper.evaluate(function (cadastralNumber) {

            if (cadastralNumber)
                $('.v-textfield').slice(0, 1).focus().val(cadastralNumber);

        }, vars.cadastralArray[vars.currentCadastralIndex]);


        if (searchData.region) {
            //console.log(searchData.region);

            casper.evaluate(function (region) {
                document.querySelectorAll('.v-filterselect-button')[0].click();
                $(".v-filterselect-input").slice(0, 1).select().val(region).keyup(); // ЗНАЧЕНИЕ СЮДА        
            }, searchData.region);

            //casper.wait(2000, function () {
            casper.waitForSelector('.v-filterselect-suggestmenu', function () {

                casper.evaluate(function () {
                    $('.gwt-MenuItem').first().click();
                });

                casper.wait(5000, function () {
                    casper.evaluate(function () {
                        $("span:contains('Найти')").click();
                    });

                    takeDebugScreenShot('После нажатия на найти', vars.counter++);

                    //casper.wait(2000, function () {
                    casper.waitForSelector('.v-table-body', function () {

                        takeDebugScreenShot('Таблица появилась', vars.counter++);

                        casper.wait(5000, function () {
                            var row = casper.evaluate(function (index) {

                                $('.v-window-modalitycurtain').hide();
                                $('.popupContent').hide();

                                return $.map($('.v-table-row, .v-table-row-odd'), function (value, key) {
                                    var rowObject = {};

                                    rowObject.number = index + 1;
                                    rowObject.cadastralNumber = value.childNodes[0].innerText.replace(/[\r\n]+/g, '');
                                    rowObject.address = value.childNodes[1].innerText.replace(/[\r\n]+/g, '');
                                    rowObject.objectType = value.childNodes[2].innerText.replace(/[\r\n]+/g, '');
                                    rowObject.area = value.childNodes[3].innerText.replace(/[\r\n]+/g, '');
                                    rowObject.isLoaded = false;

                                    return rowObject;
                                });


                            }, vars.currentCadastralIndex);

                            vars.tableRows = vars.tableRows.concat(row);

                            casper.evaluate(function () {
                                $('.v-table-row, .v-table-row-odd').slice(0, 1).trigger('mouseup');
                            });

                            casper.waitForSelector('.v-radiobutton', function success() {

                                casper.wait(3000, function () {
                                    if (casper.exists("body")) {
                                        takeDebugScreenShot('Появилась страница с кнопкой на запрос', vars.counter++);

                                    }

                                    casper.wait(2000, function () {

                                        casper.evaluate(function () {
                                            $('span:contains("Отправить запрос")').click();
                                        });                                       

                                        var d = new Date();
                                        vars.tableRows[vars.currentCadastralIndex].createDate = d.getDate() + "-" + (d.getMonth() + 1) +   "-"  + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();

                                        casper.waitForSelector('.popupContent .v-window-wrap .v-window-contents', function () {

                                            if (casper.exists("body")) {
                                                takeDebugScreenShot('Появился попап', vars.counter++);
                                                ////console.log('screenshots/Появился попАп ' + vars.counter++ + '.png');
                                            }

                                            vars.tableRows[vars.currentCadastralIndex].isLoaded = true;

                                            casper.wait(5000, function () {

                                                vars.tableRows[vars.currentCadastralIndex].numberOfRequest = casper.evaluate(function () {
                                                    return $('.tipFont b').first()[0].innerText;
                                                });

                                                takeDebugScreenShot('Появился текст', vars.counter++);

                                                casper.evaluate(function () {
                                                    $('span:contains("Продолжить работу")').click();
                                                });

                                                //casper.waitForSelector('.navigationPanel', function () {
                                                casper.wait(5000, function () {
                                                    //лcasper.wait(3000, function () {
                                                    if (casper.exists("body")) {
                                                        takeDebugScreenShot('нажал на продолжить работу', vars.counter++);
                                                        ////console.log('screenshots/Нажал на Продолжить работу' + vars.counter++ + '.png');
                                                    }

                                                    casper.evaluate(function () {
                                                        document.querySelector('.v-button-caption').click();
                                                    });

                                                    logMessage('NumberOfRequest: ' + vars.tableRows[vars.currentCadastralIndex].numberOfRequest);

                                                    vars.currentCadastralIndex++;                                                    
                                                    
                                                    logMessage('Before next iteration. Current cadastral number: ' + vars.currentCadastralIndex + " | cadastralArray.length: " + vars.cadastralArray.length);
                                                    if (vars.currentCadastralIndex < vars.cadastralArray.length) {
                                                        casper.then(iterateCadastralArray);
                                                        // addBadResponseToResults();
                                                        // console.log(JSON.stringify(vars.tableRows, "", 4));
                                                        // logMessage(JSON.stringify(vars.cadastralArray, "", 4));
                                                        // logMessage(JSON.stringify(vars.tableRows, "", 4));
                                                        // casper.exit(1);
                                                    }

                                                }, function () {
                                                    logMessage('Cant find naviagation panel');
                                                    takeDebugScreenShot('Панель навигации не найдена', vars.counter++);
                                                }, 15000);

                                            });
                                        });
                                    });
                                });

                            }, function () {


                                casper.evaluate(function () {
                                    document.querySelector('.v-button-caption').click();
                                });
                                vars.tableRows[vars.currentCadastralIndex].createDate = new Date().toString().split('GMT')[0];
                                vars.tableRows[vars.currentCadastralIndex].isLoaded = false;
                                vars.tableRows[vars.currentCadastralIndex].numberOfRequest = 'NULLED';
                                vars.currentCadastralIndex++;

                                takeDebugScreenShot('Поиск в нулевом', vars.counter++);
                                if (vars.currentCadastralIndex < vars.cadastralArray.length)
                                    casper.then(iterateCadastralArray);

                            }, 30000);
                        });
                    });
                });
            });
        }
        //});

        // });

    }, function () {

        takeDebugScreenShot('BEFORE another time', vars.counter++);

        afterReloadAuth();

    }, 30000);
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

// должна быть после casper.then(iteratePagination);
function iteratePagination() {

    casper.wait(1000, function () {

        takeDebugScreenShot("В итерации страниц с данными", vars.counter++)

        var newArr = casper.evaluate(function () {

            return [].map.call(__utils__.findAll('tbody td.td:nth-child(2)'), function (node) {
                return node.innerText;
            });

        });

        vars.cadastralArray = vars.cadastralArray.concat(newArr);

        casper.waitFor(function check() {
            return this.evaluate(function () {
                return document.querySelectorAll('.brdnav0')[3].onclick !== null;
            });
        }, function then() {    // step to execute when check() is ok

            casper.evaluate(function () {
                document.querySelectorAll('.brdnav0')[2].click();
            });
            casper.then(iteratePagination);
        }, function timeout() { // step to execute if check has failed
            takeDebugScreenShot("селектор пуст", vars.counter++)
        }, 3000);

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