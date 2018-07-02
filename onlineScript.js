var fs = require('fs');
/** settings */
var casperSettings = require('./Modules/casperSettingsModule');

var casper = require('casper').create(casperSettings);

/** error handlers */
casper.options.onWaitTimeout = function () {
    saveAnError("Ошибка по таймауту", vars.counter++);
};

casper.on('error', function (msg, backtrace) {
    saveAnError('Непредвиденная ошибка ' + msg, vars.counter++);
});

var folders = require('./Modules/foldersModule').getFolders();
console.log('folders', JSON.stringify(folders, "", 4));



function saveAnError(errorText, counter) {

    var errorTime = new Date().toLocaleString("ru");

    logMessage(errorText, errorTime);
    createErrorScreenShot(errorText, errorTime, vars.counter++);

    if (errorText === "Ошибка по таймауту" && vars.currentCadastralIndex !== 0) {
        casper.evaluate(function () {
            $('.v-Notification')[0].click();
        });

        afterReloadAuth();
    }    
}

function logMessage(text, time) {
    fs.write(folders.baseDir + folders.logFile, text + " " + time + "\n", "a");
}

function createErrorScreenShot(screenShotName, time, counter) {

    var screenShotName = folders.baseDir + folders.ErrorFolder + screenShotName + " " + counter + '.png';
    //console.log(screenShotName);
    casper.capture(screenShotName);
}

function takeDebugScreenShot(text, counter) {
    var screenShotName = folders.baseDir + folders.DebugFolder + counter + " " + text + '.png';
    //console.log(screenShotName);
    casper.capture(screenShotName);
}



var searchData = require('./Modules/argsModule').getArgs(casper);
console.log('searchData', JSON.stringify(searchData, "", 4));


var vars = require('./Modules/varsModule').getVars();
console.log('vars', JSON.stringify(vars, "", 4));


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

    takeDebugScreenShot("После заполнения поисковых данных", vars.counter++)

});


casper.waitForSelector(".portlet-title", function () {

    var objectsAreFound = casper.evaluate(function () {
        return document.querySelector('#pg_stats b:first-child').innerHTML.replace(new RegExp('&nbsp;', 'g'), '');
    });

    takeDebugScreenShot("Найдено " + objectsAreFound + " объектов", vars.counter++)
});

//var cadastralArray = [];

casper.then(iteratePagination);

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
            //console.log('selector doent null');
            casper.evaluate(function () {
                document.querySelectorAll('.brdnav0')[2].click();
            });
            casper.then(iteratePagination);
        }, function timeout() { // step to execute if check has failed
            takeDebugScreenShot("селектор пуст", vars.counter++)
        }, 3000);

    });


}


casper.thenOpen('https://rosreestr.ru/site/');


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

    //console.log('\nauthentification completed\n');

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

    //console.log('\nkey received\n');

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

// var currentCadastralIndex = 0;
// var tableRows = [];



function saveToDebugLog(text) {

    var time = new Date();

    fs.write(folders.baseDir + folders.logFile, text + " " + time + "\n", "a");
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

        takeDebugScreenShot('До заполнения данных', vars.counter++);

        saveToDebugLog('search cadastral index ' + vars.currentCadastralIndex + ' ' + vars.cadastralArray[vars.currentCadastralIndex]);

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


                            }, currentCadastralIndex);

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

                                        vars.tableRows[vars.currentCadastralIndex].createDate = new Date().toString().split('GMT')[0];

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

                                                    vars.currentCadastralIndex++;

                                                    saveToDebugLog('currentCadastralIndex: ' + vars.currentCadastralIndex + " | cadastralArray.length + 1: " + (vars.cadastralArray.length + 1));
                                                    if (vars.currentCadastralIndex < vars.cadastralArray.length)
                                                        casper.then(iterateCadastralArray);
                                                }, function () {
                                                    saveToDebugLog('navigation panel doesnt exist');
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

        // casper.waitForSelector('.blockGrey', function () {

        //     casper.wait(5000, function () {

        //         takeDebugScreenShot('greyBlockExist', vars.counter++);

        //         var keyParts = accessKey.split('-');

        //         casper.evaluate(function (val) {

        //             for (var i = 0; i < 5; i++) {
        //                 document.querySelectorAll('.v-textfield')[i].value = val[i];
        //                 $('.v-textfield').slice(i, i + 1).trigger("change");
        //             }

        //             document.querySelector('.v-button-wrap').click();

        //         }, keyParts);



        //         casper.wait(5000, function () {

        //             takeDebugScreenShot('keyWriten and accepted', vars.counter++);

        //             casper.evaluate(function () {
        //                 document.querySelector('.v-button-caption').click();
        //             });

        //             takeDebugScreenShot('AFTER another time', vars.counter++);

        //             casper.then(iterateCadastralArray);
        //         });
        //});

        //});

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
        console.log(JSON.stringify(vars.tableRows, "", 4));
        casper.exit(1);
    });
}

casper.wait(5000, function () {

    // console.log("finish");
    // console.log(JSON.stringify(cadastralArray, "", 4));
    // console.log('\n\n\n -------------------- \n\n\n');
    console.log(JSON.stringify(vars.tableRows, "", 4));

    saveToDebugLog(JSON.stringify(vars.cadastralArray, "", 4))
    saveToDebugLog(JSON.stringify(vars.tableRows, "", 4))

    takeDebugScreenShot('Финиш', vars.counter++);
});


casper.run();