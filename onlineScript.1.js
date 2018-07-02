/** settings */
var casper = require('casper').create({
    verbose: true,                  // log messages will be printed out to the console
    //logLevel: 'debug',
    pageSettings: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
    }
    ,
    onWaitTimeout: function () {
        saveAnError("Ошибка по таймауту", counter);
    },
});


casper.options.waitTimeout = 120000;
casper.options.viewportSize = { width: 1024, height: 800 };

//var baseDir = "C:\\Users\\roskvartal-pc\\Desktop\\RosReestrProject\\";
var baseDir = ".\\";
var onlineRequestsErrorFolderName = "OnlineRequestErrors1\\";
var onlineRequestsDebugFolderName = "OnlineRequestDebug1\\";
var logFileName = "OnlineRequests1.log";
var debugLogFileName = 'OnlineDebugRequests1.log';

/** clear folders */
var fs = require('fs');
//var toDeleteErrorFolder = baseDir + onlineRequestsErrorFolderName;
var toDeleteDebugFolder = baseDir + onlineRequestsDebugFolderName;

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
fs.removeTree(toDeleteDebugFolder);

/** error handlers */
casper.on('error', function (msg, backtrace) {
    saveAnError('Непредвиденная ошибка ' + msg, counter);
});

//console.log("\n\n-------------------------------- \n search arguments:");

function saveAnError(errorText, counter) {

    var errorTime = new Date().toLocaleString("ru");

    logMessage(errorText, errorTime);
    createErrorScreenShot(errorText, errorTime, counter);

    if (errorText === "Ошибка по таймауту" && currentCadastralIndex !== 0) {
        casper.evaluate(function () {
            $('.v-Notification')[0].click();
        });

        afterReloadAuth();
    }
    //writeToConsole(errorText, errorTime);        

    //casper.exit(1);
}

// function writeToConsole(text, time) {
//     console.log(JSON.stringify({errorMessage: text, errorDate: time}, "", 4))
// }

function logMessage(text, time) {
    fs.write(baseDir + logFileName, text + " " + time + "\n", "a");
}

function createErrorScreenShot(screenShotName, time, counter) {

    var screenShotName = baseDir + onlineRequestsErrorFolderName + screenShotName + " " + counter + '.png';
    //console.log(screenShotName);
    casper.capture(screenShotName);
}

function takeDebugScreenShot(text, counter) {
    var screenShotName = baseDir + onlineRequestsDebugFolderName + counter + " " + text + '.png';
    //console.log(screenShotName);
    casper.capture(screenShotName);
}

/** arguments processing */
// casper.echo("Casper CLI passed options:");
// require("utils").dump(casper.cli.options);
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

if (casper.cli.has("apartmentNumber") && casper.cli.get("apartmentNumber") !== "") {
    //console.log('in appartment number');
    searchData.apartmentNumber = casper.cli.get("apartmentNumber");
}

if (casper.cli.has("building") && casper.cli.get("building") !== "") {
    //console.log('in appartment number');
    searchData.building = casper.cli.get("building");
}




for (var i in searchData) {
    if (typeof searchData[i] === 'string')
        searchData[i] = searchData[i].replace("\\", " ");

    //console.log(searchData[i])
}

/** variables */
var counter = 1; // screenshot index variable
var accessKey = undefined;




casper.start('https://rosreestr.ru/wps/portal/p/cc_ib_portal_services/online_request/');

// Открываем сайт, переходим по ссылке на личный кабинет
casper.waitForSelector('.portlet-body', function () {


    casper.evaluate(function (region) {
        document.querySelector('#adress').checked = true;

        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true);

        if (region) {
            var regionInput = document.getElementById("subjectId");

            [].some.call(regionInput.options, function (i) {
                // do whatever
                if (i.text.match(region)) {
                    i.selected = true;
                    return true;
                }

            });

            regionInput.dispatchEvent(evt);
        }

    }, searchData.region);


});

casper.wait(1000, function () {

    casper.evaluate(function (zone, street, houseNumber, building) {

        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true);

        if (zone) {
            var zoneInput = document.getElementById("regionId");

            [].some.call(zoneInput.options, function (i) {
                // do whatever
                if (i.text.match(zone)) {
                    i.selected = true;
                    return true;
                }
            });

            zoneInput.dispatchEvent(evt);
        }

        if (street) {
            var streetInput = document.querySelector('input[name="street"]');
            streetInput.value = street;
            streetInput.dispatchEvent(evt);
        }


        if (houseNumber) {
            var houseNumberInput = document.querySelector('input[name="house"]');
            houseNumberInput.value = houseNumber;
            houseNumberInput.dispatchEvent(evt);
        }


        if (building) {
            var buildingInput = document.querySelector('input[name="building"]');
            buildingInput.value = building;
            buildingInput.dispatchEvent(evt);
        }

        document.querySelector('#submit-button').click()

    }, searchData.zone, searchData.street, searchData.houseNumber, searchData.building);

    takeDebugScreenShot("После заполнения поисковых данных", counter++)

});


casper.waitForSelector(".portlet-title", function () {

    var objectsAreFound = casper.evaluate(function () {
        return document.querySelector('#pg_stats b:first-child').innerHTML.replace(new RegExp('&nbsp;', 'g'), '');
    });

    takeDebugScreenShot("Найдено " + objectsAreFound + " объектов", counter++)
});

var cadastralArray = [];

casper.then(iteratePagination);

function iteratePagination() {

    casper.wait(1000, function () {

        takeDebugScreenShot("В итерации страниц с данными", counter++)

        var newArr = casper.evaluate(function () {

            return [].map.call(__utils__.findAll('tbody td.td:nth-child(2)'), function (node) {
                return node.innerText;
            });

        });

        cadastralArray = cadastralArray.concat(newArr);

        casper.waitFor(function check() {
            return this.evaluate(function () {
                return document.querySelectorAll('.brdnav0')[3].onclick !== null;
            });
        }, function then() {    // step to execute when check() is ok
            //console.log('selector doent null');
            casper.evaluate(function () {
                document.querySelectorAll('.brdnav0')[2].click();
            });
            casper.then(iteratePagination);
        }, function timeout() { // step to execute if check has failed
            takeDebugScreenShot("селектор пуст", counter++)
        }, 3000);

    });


}


casper.thenOpen('https://rosreestr.ru/site/'
    // , function () {
    //     //console.log('\nstart processing https://rosreestr.ru/site/\n');
    // }
);


// Открываем сайт, переходим по ссылке на личный кабинет
casper.waitForSelector('#page_header', function () {
    //casper.capture('screenshots/' + counter++ + '.png');
    this.mouse.click('a[href$="https://rosreestr.ru/wps/portal/p/PrivateOffice"]');
    //casper.capture('screenshots/' + counter++ + '.png');
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
        $("div:contains('Парсамян Ирэн Арутюновна ')").click();
    });

    takeDebugScreenShot('выбираем исполнителя по имени', counter++);
});

// Идём в "Мои ключи"
casper.waitForSelector('.finances', function () {

    //console.log('\nauthentification completed\n');

    casper.evaluate(function () {
        $("div:contains('Мои ключи')").click();
    });

    takeDebugScreenShot('Идём в Мои ключи', counter++);
});

// Запоминаем ключ
casper.waitForSelector('.kadastral-results-search', function () {

    accessKey = casper.evaluate(function () {
        return document.querySelector('.right-column strong').innerHTML;
    });

    casper.evaluate(function () {
        $("a.logo").click();
    });

    takeDebugScreenShot('Запоминаем ключ', counter++);
});


// Переходим на сайт реестра
casper.waitForSelector('.view-all', function () {

    //console.log('\nkey received\n');

    casper.evaluate(function () {
        document.querySelector('.view-all').removeAttribute("target");
        document.querySelector('.view-all').click();
    });

    takeDebugScreenShot('Переходим на сайт реестра', counter++);
});


// Переходим на "получение сведений ЕГРН"
casper.waitForSelector('.eservice_box', function () {

    casper.evaluate(function () {
        document.querySelector('a[href$="https://rosreestr.ru/wps/portal/p/cc_present/EGRN_1"]').click();
    });

    takeDebugScreenShot('Переходим на получение сведений ЕГРН', counter++);
});

// Запрос посредством доступа к ФГИС ЕГРН
casper.waitForSelector('.menu-navigation-list', function () {

    casper.evaluate(function () {
        document.querySelector('a[href$="/wps/portal/p/cc_present/ir_egrn"]').click();
    });

    takeDebugScreenShot('Запрос к ФГИС ЕГРН', counter++);
});


// заполняю ключ для доступа
casper.waitForSelector('.blockGrey', function () {

    var keyParts = accessKey.split('-');

    casper.evaluate(function (val) {

        for (var i = 0; i < 5; i++) {
            document.querySelectorAll('.v-textfield')[i].value = val[i];
            $('.v-textfield').slice(i, i + 1).trigger("change");
        }

        document.querySelector('.v-button-wrap').click();

    }, keyParts);


    takeDebugScreenShot('Заполняю ключ для доступа', counter++);

});

casper.wait(5000, function () {
    casper.evaluate(function () {
        document.querySelector('.v-button-caption').click();
    });
})

casper.wait(5000, function () {

    takeDebugScreenShot('После выбора поиска но до итерации', counter++);

    casper.then(iterateCadastralArray);
});

var currentCadastralIndex = 0;
var tableRows = [];

function saveToDebugLog(text) {

    var time = new Date();

    fs.write(baseDir + debugLogFileName, text + " " + time + "\n", "a");
}

function iterateCadastralArray() {

    saveToDebugLog('nnew iterate cadastral');

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

        takeDebugScreenShot('До заполнения данных', counter++);

        saveToDebugLog('search cadastral index ' + currentCadastralIndex + ' ' + cadastralArray[currentCadastralIndex]);

        casper.evaluate(function (cadastralNumber) {

            if (cadastralNumber)
                $('.v-textfield').slice(0, 1).focus().val(cadastralNumber);

        }, cadastralArray[currentCadastralIndex]);


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

                    takeDebugScreenShot('После нажатия на найти', counter++);

                    //casper.wait(2000, function () {
                    casper.waitForSelector('.v-table-body', function () {

                        takeDebugScreenShot('Таблица появилась', counter++);

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


                            }, currentCadastralIndex);

                            tableRows = tableRows.concat(row);

                            casper.evaluate(function () {
                                $('.v-table-row, .v-table-row-odd').slice(0, 1).trigger('mouseup');
                            });

                            casper.waitForSelector('.v-radiobutton', function success() {

                                casper.wait(3000, function () {
                                    if (casper.exists("body")) {
                                        takeDebugScreenShot('Появилась страница с кнопкой на запрос', counter++);

                                    }

                                    casper.wait(2000, function () {

                                        casper.evaluate(function () {
                                            $('span:contains("Отправить запрос")').click();
                                        });

                                        tableRows[currentCadastralIndex].createDate = new Date().toString().split('GMT')[0];

                                        casper.waitForSelector('.popupContent .v-window-wrap .v-window-contents', function () {

                                            if (casper.exists("body")) {
                                                takeDebugScreenShot('Появился попап', counter++);
                                                ////console.log('screenshots/Появился попАп ' + counter++ + '.png');
                                            }

                                            tableRows[currentCadastralIndex].isLoaded = true;

                                            casper.wait(5000, function () {

                                                tableRows[currentCadastralIndex].numberOfRequest = casper.evaluate(function () {
                                                    return $('.tipFont b').first()[0].innerText;
                                                });

                                                takeDebugScreenShot('Появился текст', counter++);

                                                casper.evaluate(function () {
                                                    $('span:contains("Продолжить работу")').click();
                                                });

                                                //casper.waitForSelector('.navigationPanel', function () {
                                                casper.wait(5000, function () {
                                                    //лcasper.wait(3000, function () {
                                                    if (casper.exists("body")) {
                                                        takeDebugScreenShot('нажал на продолжить работу', counter++);
                                                        ////console.log('screenshots/Нажал на Продолжить работу' + counter++ + '.png');
                                                    }

                                                    casper.evaluate(function () {
                                                        document.querySelector('.v-button-caption').click();
                                                    });

                                                    currentCadastralIndex++;

                                                    saveToDebugLog('currentCadastralIndex: ' + currentCadastralIndex + " | cadastralArray.length + 1: " + (cadastralArray.length + 1));
                                                    if (currentCadastralIndex < cadastralArray.length)
                                                        casper.then(iterateCadastralArray);
                                                }, function () {
                                                    saveToDebugLog('navigation panel doesnt exist');
                                                    takeDebugScreenShot('Панель навигации не найдена', counter++);
                                                }, 15000);

                                            });
                                        });
                                    });
                                });

                            }, function () {


                                casper.evaluate(function () {
                                    document.querySelector('.v-button-caption').click();
                                });
                                tableRows[currentCadastralIndex].createDate = new Date().toString().split('GMT')[0];
                                tableRows[currentCadastralIndex].isLoaded = false;
                                tableRows[currentCadastralIndex].numberOfRequest = 'NULLED';
                                currentCadastralIndex++;

                                takeDebugScreenShot('Поиск в нулевом', counter++);
                                if (currentCadastralIndex < cadastralArray.length)
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

        takeDebugScreenShot('BEFORE another time', counter++);        

        afterReloadAuth();

        // casper.waitForSelector('.blockGrey', function () {

        //     casper.wait(5000, function () {

        //         takeDebugScreenShot('greyBlockExist', counter++);

        //         var keyParts = accessKey.split('-');

        //         casper.evaluate(function (val) {

        //             for (var i = 0; i < 5; i++) {
        //                 document.querySelectorAll('.v-textfield')[i].value = val[i];
        //                 $('.v-textfield').slice(i, i + 1).trigger("change");
        //             }

        //             document.querySelector('.v-button-wrap').click();

        //         }, keyParts);



        //         casper.wait(5000, function () {

        //             takeDebugScreenShot('keyWriten and accepted', counter++);

        //             casper.evaluate(function () {
        //                 document.querySelector('.v-button-caption').click();
        //             });

        //             takeDebugScreenShot('AFTER another time', counter++);

        //             casper.then(iterateCadastralArray);
        //         });
        //});

        //});

    }, 30000);
}

function afterReloadAuth() {

    takeDebugScreenShot('start in afterReloadAuth', counter++);

    casper.evaluate(function () {
        location.reload();
    });

    takeDebugScreenShot('after reload', counter++);    

    casper.waitForSelector('.blockGrey', function () {

        casper.wait(5000, function () {

            takeDebugScreenShot('greyBlockExist', counter++);

            var keyParts = accessKey.split('-');

            casper.evaluate(function (val) {

                for (var i = 0; i < 5; i++) {
                    document.querySelectorAll('.v-textfield')[i].value = val[i];
                    $('.v-textfield').slice(i, i + 1).trigger("change");
                }

                document.querySelector('.v-button-wrap').click();

            }, keyParts);



            casper.wait(5000, function () {

                takeDebugScreenShot('keyWriten and accepted', counter++);

                casper.evaluate(function () {
                    document.querySelector('.v-button-caption').click();
                });

                takeDebugScreenShot('AFTER another time', counter++);

                casper.then(iterateCadastralArray);
            });
        });

    }, function() {
        takeDebugScreenShot('cant find grey block after error', counter++);
        console.log(JSON.stringify(tableRows, "", 4));
        casper.exit(1);
    });
}

casper.wait(5000, function () {

    // console.log("finish");
    // console.log(JSON.stringify(cadastralArray, "", 4));
    // console.log('\n\n\n -------------------- \n\n\n');
    console.log(JSON.stringify(tableRows, "", 4));

    saveToDebugLog(JSON.stringify(cadastralArray, "", 4))
    saveToDebugLog(JSON.stringify(tableRows, "", 4))

    takeDebugScreenShot('Финиш', counter++);
});


casper.run();