/**
table todo:
    1. DONE Ячейки привязываются к базовой. Расчет положения - (размер ячейки + зазор) * номер. Это даст возможность удалять ячейки. 
       DONE - Если разные по размеру, где хранить значения? Dropdown menu?
       DONE - Зазор может быть отрицательным
    2. DONE текст ячейки привязывается к центру фигуры. У обеих анкор в центре. 
    3. DONE Таблица создается с нуля
    4. header cells, horizontal and vertical
    5. import style, json or xml
    6. basic style setup in start dialog
    7. export style?
    8. 
    


*/

function processProperty(theProp) {
    if (theProp.propertyType == PropertyType.PROPERTY) {
        try {
            log(theProp.name + " " + theProp.value);
        } catch (e) {
            log(theProp.name + " " + "NO VALUE");
        }
        if (theProp.name === "Path") {
            log(1);
        }
    } else {
        for (var i = 1; i <= theProp.numProperties; i++) {
            processProperty(theProp.property(i));
        }
    }
}

function log(input) {
    $.writeln(input);
    var logFile = File("e:/logfile.txt");
    logFile.open("a");
    logFile.writeln(input);
    logFile.close();
}

function createTable(columns, rows, csv, compID, isHorizHeader, isVertHeader) {
    const mainNull = "mainNull";

    const expressions = {
        textPosition: "try { \n" + 
                "    var n = thisLayer.name.split("-");\n" + 
                "    var cel = thisComp.layer(`${n[1]}-${n[2]}`).content(\"Rectangle 1\").content(\"Rectangle Path 1\").size;\n" + 
                "    var pos = thisComp.layer(`${n[1]}-${n[2]}`).transform.position;\n" + 
                "    [pos[0] + cel[0] / 2, pos[1] + cel[1] / 2];\n" + 
                "} catch (e) {\n" + 
                "    [-200, 0];\n" + 
                "}",

        cellSize: "var coords = effect(\"cellCoordinates\")(\"Point\");\n" +
                "var cellSize = effect(\"cellSize\")(\"Point\");\n" +
                "function newSize(direction) {\n" +
                "    var axis = direction === 0 ? \"x\" : \"y\";\n" +
                "    var d = cellSize[direction];\n" +
                "    var x = 0;\n" +
                "    for (var i = 0; i < d; i++) {\n" +
                "        x += thisComp.layer(\"" + mainNull + "\").effect(`${axis}${coords[direction] + i}`)(\"Slider\");\n" +
                "    }\n" +
                "    return x * 10 + thisComp.layer(\"" + mainNull + "\").effect(\"gap\")(\"Slider\") * (cellSize[direction] - 1);\n" +
                "}\n" +
                "[newSize(0), newSize(1)];",

        cellAnchor: "var p = content(\"Rectangle 1\").content(\"Rectangle Path 1\").size;\n" + 
                "[p[0] / 2 * -1, p[1] / 2 * -1];",

        cellPosition: "var coords = effect(\"cellCoordinates\")(\"Point\");\n" +
                "var x = thisComp.layer(\"" + mainNull + "\").effect(`${coords[0]}`)(\"Point\")[1];\n" +
                "var y = thisComp.layer(\"" + mainNull + "\").effect(`${coords[1]}`)(\"Point\")[0];\n" +
                "[x, y];", 

        cellScale: "[100, 100];",

        coordPoint0: "var p = thisComp.layer(\"1-1\").transform.position;\n" + 
                "[p[1], p[0]]",

        coordPoints: "var thisNum = 1;\n" +
                "var multiplier = effect(\"multiplier\")(\"Slider\");\n" +
                "var x = effect(`y${thisNum}`)(\"Slider\") * multiplier;\n" +
                "var y = effect(`x${thisNum}`)(\"Slider\") * multiplier;\n" +
                "var gap = effect(\"gap\")(\"Slider\");\n" +
                "var prevCoords = effect(`${thisNum}`)(\"Point\");\n" +
                "[x + gap + prevCoords[0], y + gap + prevCoords[1]];",

    }


    var comp = app.project.itemByID(compID);

    

    var csvFile = File(csv);
    new ImportOptions().file = csvFile;

    app.project.importFile(ImportOptions);

    csvFile.open("r");
    
    var data = csvFile.read().split("\n");
    var line = data[0].split("\t");
    
    
    csvFile.close();
    
    
    var fld = app.project.file.fsName;
    log(fld);




    log(compID);
    log(columns);
    log(rows);
    log(csv);
    log(isHorizHeader);
    log(isVertHeader);



}

function promptWindow() {
    
    var comp = app.project.activeItem;

    var comps = new Array();
    var compIDs = new Array();

    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i) instanceof CompItem) {
            comps.push(app.project.item(i).name);
            compIDs.push(app.project.item(i).id)
        }
    }

    const elMaxWidth = 450;
    const buttonWidth = 80;
    const elHeight = 50;
    const margins = 10;
    const spacings = 10;
    fileIsSelected = false;
    
    var dialog = new Window("dialog"); 
    dialog.text = "Создание таблицы"; 
    // dialog.preferredSize.width = 450; 
    // dialog.preferredSize.height = 250; 
    dialog.orientation = "column"; 
    dialog.alignChildren = ["center","top"]; 
    dialog.spacing = spacings; 
    dialog.margins = margins; 

    var tabs =  dialog.add("tabbedpanel", undefined, undefined, {name: "tabPanel"}); 
    tabs.alignChildren = "fill"; 
    // tabs.preferredSize.width = elMaxWidth; 
    // tabs.preferredSize.height = 250; 
    tabs.margins = margins; 


    var tabMain = tabs.add("tab", undefined, undefined, {name: "Таблица"}); 
    tabMain.text = "Таблица"; 
    tabMain.orientation = "column"; 
    tabMain.alignChildren = ["center","top"]; 
    tabMain.spacing = spacings; 
    tabMain.margins = margins; 

    var tabStyles = tabs.add("tab", undefined, undefined, {name: "Стили таблицы"}); 
    tabStyles.text = "Стили таблицы"; 
    tabStyles.orientation = "column"; 
    tabStyles.alignChildren = ["left","top"]; 
    tabStyles.spacing = spacings; 
    tabStyles.margins = margins; 

    var mainGroup = tabMain.add("group", undefined, {name: "mainGroup"}); 
    mainGroup.orientation = "column"; 
    mainGroup.alignChildren = ["left","center"]; 
    mainGroup.spacing = spacings; 
    mainGroup.margins = margins; 

    var topGroup = mainGroup.add("group", undefined, {name: "topGroup"}); 
    topGroup.orientation = "row";
    topGroup.alignChildren = ["left","center"];
    // topGroup.spacing = spacings;
    // topGroup.margins = margins;

    var headerPanel = topGroup.add("panel", undefined, undefined, {name: "headerPanel"}); 
    headerPanel.text = "Введите размер таблицы:"; 
    headerPanel.preferredSize.height = elHeight * 1.8; 
    headerPanel.preferredSize.width = elMaxWidth - 300; 
    headerPanel.orientation = "row"; 
    headerPanel.alignChildren = ["right","center"]; 
    headerPanel.spacing = spacings; 
    headerPanel.margins = margins; 

    var tableHeaderSelect = topGroup.add("panel", undefined, undefined, {name: "tableHeaderSelect"});
    tableHeaderSelect.text = "Заголовки таблицы:"; 
    tableHeaderSelect.preferredSize.height = elHeight * 1.8; 
    tableHeaderSelect.preferredSize.width = elMaxWidth - 200;
    tableHeaderSelect.orientation = "column"; 
    tableHeaderSelect.alignChildren = ["left","center"]; 
    tableHeaderSelect.spacing = spacings; 
    tableHeaderSelect.margins = margins; 

    var rowColGroup = headerPanel.add("group", undefined, {name: "rowColGroup"}); 
    rowColGroup.orientation = "column"; 
    rowColGroup.alignChildren = ["right","center"];

    var rowGroup = rowColGroup.add("group", undefined, {name: "rowGroup"}); 
    rowGroup.orientation = "row";
    rowGroup.alignChildren = ["right","center"];

    var colGroup = rowColGroup.add("group", undefined, {name: "colGroup"}); 
    colGroup.orientation = "row";
    colGroup.alignChildren = ["right","center"];

    var stringsLabel = rowGroup.add("statictext", undefined, undefined, {name: "stringsLabel"}); 
    stringsLabel.text = "Строки:"; 

    var rows = rowGroup.add('edittext {properties: {name: "rows"}}'); 
    rows.preferredSize.width = 50; 
    rows.text = "0"; 

    var columnsLabel = colGroup.add("statictext", undefined, undefined, {name: "columnsLabel"}); 
    columnsLabel.text = "Столбцы:"; 

    var columns = colGroup.add('edittext {properties: {name: "columns"}}'); 
    columns.preferredSize.width = 50; 
    columns.text = "0";

    var headerIsHoriz = tableHeaderSelect.add("checkbox", undefined, undefined, {name: "headerIsHoriz"}); 
    headerIsHoriz.text = "Горизонтальные заголовки"; 

    var headerIsVert = tableHeaderSelect.add("checkbox", undefined, undefined, {name: "headerIsVert"}); 
    headerIsVert.text = "Вертикальные заголовки"; 

    var filePanel = mainGroup.add("panel", undefined, undefined, {name: "filePanel"}); 
    filePanel.text = "или укажите CSV-файл:"
    filePanel.preferredSize.height = elHeight; 
    filePanel.preferredSize.width = elMaxWidth; 
    filePanel.orientation = "row"; 
    filePanel.alignChildren = ["left","center"]; 
    filePanel.spacing = spacings; 
    filePanel.margins = margins; 

    var fileAddress = filePanel.add('edittext {properties: {name: "fileAddress"}}'); 
    fileAddress.text = ""
    fileAddress.preferredSize.width = 260; 

    var btnSelectFile = filePanel.add("button", undefined, undefined, {name: "btnSelectFile"});
    btnSelectFile.text = "Выбрать файл с данными";
    btnSelectFile.preferredSize.width = buttonWidth * 2;
    btnSelectFile.onClick = function() {
        var file = File.openDialog("Выбрать файл (CSV, TSV, TXT):", "Файл с данными: *.csv; *.tsv; *.txt, Все файлы: *.*");
        if (file) {
            fileAddress.text = file.fsName;
            fileIsSelected = true;
        }
    }

    var sequencePanel = mainGroup.add("panel", undefined, undefined, {name: "sequencePanel",});
    sequencePanel.text = "Композиция для добавления таблицы:";
    sequencePanel.preferredSize.height = elHeight;
    sequencePanel.preferredSize.width = elMaxWidth;

    var dropMenu = sequencePanel.add("dropdownlist", undefined, comps);
    if (comp !== null) {
        dropMenu.selection = comps.indexOf(comp.name);
    } else {
        dropMenu.selection = 0;
    }
    dropMenu.preferredSize.width = elMaxWidth - 30;
    
    var buttons = dialog.add("group", undefined, {name: "buttons"}); 
    buttons.preferredSize.width = elMaxWidth; 
    buttons.orientation = "row"; 
    buttons.alignChildren = ["right","bottom"]; 
    buttons.spacing = spacings; 
    buttons.margins = 0; 

    var btnOK = buttons.add("button", undefined, undefined, {name: "ok"}); 
    btnOK.text = "OK"; 
    btnOK.preferredSize.width = buttonWidth;

    var btnCancel = buttons.add("button", undefined, undefined, {name: "cancel"}); 
    btnCancel.text = "Отмена"; 
    btnCancel.preferredSize.width = buttonWidth; 
    
    btnOK.onClick = function() {
        var rowsNum = parseInt(rows.text);
        var columnsNum = parseInt(columns.text);
        if (fileIsSelected || (rowsNum > 1 && columnsNum > 1)) {
            createTable(rows.text, columns.text, fileAddress.text, 
                compIDs[comps.indexOf(dropMenu.selection.text)], headerIsHoriz.value, headerIsVert.value);
            dialog.close();
           
        } else {
            alert("Надо либо указать корректные размеры таблицы,\n" + "либо указать CSV-файл.");
        
        }
    }
    
    dialog.show();
}

function main() {
    log("Starting at " + new Date().toTimeString() + "======================");
    app.beginUndoGroup("Создание таблицы");
    promptWindow();
    app.endUndoGroup();
}

main();