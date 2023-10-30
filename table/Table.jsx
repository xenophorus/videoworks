/**
table todo:
    1. Ячейки привязываются к базовой. Расчет положения - (размер ячейки + зазор) * номер. Это даст возможность удалять ячейки. 
        - Если разные по размеру, где хранить значения? Dropdown menu?
        - Зазор может быть отрицательным
    2. текст ячейки привязывается к центру фигуры. У обеих анкор в центре. 
    3. Таблица создается с нуля, надо ли добавление ячеек? 




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

function createTable(columns, rows, csv, compName) {
    log(compName);
    log(columns);
    log(rows);
    log(csv);

}

function promptWindow() {
    
    var comp = app.project.activeItem;

    var comps = Array();

    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i) instanceof CompItem) {
            comps.push(app.project.item(i).name)
        }
    }

    const elMaxWidth = 410;
    fileIsSelected = false;
    
    var dialog = new Window("dialog"); 
    dialog.text = "Создание таблицы"; 
    dialog.preferredSize.width = 450; 
    dialog.preferredSize.height = 250; 
    dialog.orientation = "column"; 
    dialog.alignChildren = ["center","top"]; 
    dialog.spacing = 10; 
    dialog.margins = 10; 

    var mainGroup = dialog.add("group", undefined, {name: "mainGroup"}); 
    mainGroup.orientation = "column"; 
    mainGroup.alignChildren = ["left","center"]; 
    mainGroup.spacing = 10; 
    mainGroup.margins = 5; 

    var headerPanel = mainGroup.add("panel", undefined, undefined, {name: "headerPanel"}); 
    headerPanel.text = "Введите размер таблицы:"; 
    headerPanel.preferredSize.height = 50; 
    headerPanel.preferredSize.width = elMaxWidth; 
    headerPanel.orientation = "row"; 
    headerPanel.alignChildren = ["left","top"]; 
    headerPanel.spacing = 10; 
    headerPanel.margins = 10; 

    var stringsLabel = headerPanel.add("statictext", undefined, undefined, {name: "stringsLabel"}); 
    stringsLabel.text = "Строки:"; 

    var rows = headerPanel.add('edittext {properties: {name: "rows"}}'); 
    rows.preferredSize.width = 50; 
    rows.text = "0"; 

    var columnsLabel = headerPanel.add("statictext", undefined, undefined, {name: "columnsLabel"}); 
    columnsLabel.text = "Столбцы:"; 

    var columns = headerPanel.add('edittext {properties: {name: "columns"}}'); 
    columns.preferredSize.width = 50; 
    columns.text = "0";

    var filePanel = mainGroup.add("panel", undefined, undefined, {name: "filePanel"}); 
    filePanel.text = "или укажите CSV-файл:"
    filePanel.preferredSize.height = 50; 
    filePanel.preferredSize.width = elMaxWidth; 
    filePanel.orientation = "row"; 
    filePanel.alignChildren = ["left","top"]; 
    filePanel.spacing = 10; 
    filePanel.margins = 10; 

    var fileAddress = filePanel.add('edittext {properties: {name: "fileAddress"}}'); 
    fileAddress.text = "..."
    fileAddress.preferredSize.width = 250; 

    var btnSelectFile = filePanel.add("button", undefined, undefined, {name: "btnSelectFile"});
    btnSelectFile.text = "Выбрать CSV-файл";
    btnSelectFile.preferredSize.width = 120;
    btnSelectFile.onClick = function() {
        var file = File.openDialog("Выбрать CSV-файл:", "Типы файлов: *.csv, *.*");
        if (file) {
            fileAddress.text = file.fsName;
            fileIsSelected = true;
        }
    }

    var sequencePanel = mainGroup.add("panel", undefined, undefined, {name: "sequencePanel",});
    sequencePanel.text = "Композиция для добавления таблицы:";
    sequencePanel.preferredSize.height = 50;
    sequencePanel.preferredSize.width = elMaxWidth;

    var dropMenu = sequencePanel.add("dropdownlist", undefined, comps);
    if (comp !== null) {
        dropMenu.selection = comps.indexOf(comp.name);
    } else {
        dropMenu.selection = 0;
    }
    dropMenu.preferredSize.width = elMaxWidth - 40;
    
    var buttons = mainGroup.add("group", undefined, {name: "buttons"}); 
    buttons.preferredSize.width = elMaxWidth; 
    buttons.orientation = "row"; 
    buttons.alignChildren = ["right","bottom"]; 
    buttons.spacing = 10; 
    buttons.margins = 0; 

    var btnCancel = buttons.add("button", undefined, undefined, {name: "cancel"}); 
    btnCancel.text = "Отмена"; 
    btnCancel.preferredSize.width = 80; 

    var btnOK = buttons.add("button", undefined, undefined, {name: "ok"}); 
    btnOK.text = "OK"; 
    btnOK.preferredSize.width = 80;
    
    btnOK.onClick = function() {
        var rowsNum = parseInt(rows.text);
        var columnsNum = parseInt(columns.text);
        if (fileIsSelected || (rowsNum > 1 && columnsNum > 1)) {
            createTable(rows.text, columns.text, fileAddress.text, dropMenu.selection.text);
            dialog.close();
            return true;
        } else {
            alert("Надо либо указать корректные размеры таблицы,\n" + "либо указать CSV-файл.");
            return false;
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