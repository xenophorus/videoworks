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
    8. Вертикальный и горизонтальный зазоры
    


*/

function processProperty(theProp) {
    if (theProp.propertyType == PropertyType.PROPERTY) {
        try {
            log(theProp.name + " " + theProp.value);
        } catch (e) {
            log(theProp.name + " " + "NO VALUE");
        }
        if (theProp.name === "№ 1 2") {
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

function addRectangle (comp, name, size, strokeColor, strokeOpacity, 
                    strokeWidth, fillColor, fillOpacity) {
    var rectangle = comp.layers.addShape();
    rectangle.name = name;
    var shapeGroup = rectangle.property("Contents").addProperty("ADBE Vector Group");
    var rect = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    rect.property("Size").setValue(size);

    var cellCoordinates = rectangle.property("Effects").addProperty("ADBE Point Control");
    var cellCoordinatesPoint = cellCoordinates.property("Point");
    cellCoordinatesPoint.expression = "thisLayer.name.split(\"-\").map(x => parseInt(x));";
    
    cellCoordinates.name = "cellCoordinates";
    
    var cellSize = rectangle.property("Effects").addProperty("ADBE Point Control");
    cellSize.property("Point").setValue([1.0, 1.0]);
    cellSize.name = "cellSize";

    var rectStroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    rectStroke.property("Color").setValue(strokeColor);
    rectStroke.property("Opacity").setValue(strokeOpacity);
    rectStroke.property("Stroke Width").setValue(strokeWidth);

    var rectFill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    rectFill.property("Color").setValue(fillColor);
    rectFill.property("Opacity").setValue(fillOpacity);
} 

function csvData(data, separator) {
    const EOL = "\n";
    var dataArray = new Array();
    var fieldCounter = 0;
    var isOpen = false; //открыты ли кавычки

    if (data.length === 0) {
        return new Array(0, 0)
    }
    
    for (var i = 0; i < data.length; i++) {
        aChar = data[i];
        if (aChar === "\"") {
            isOpen = !isOpen;
        }

        if (!isOpen) {
            if (aChar === separator) {
                fieldCounter++;
            }
            if (aChar === EOL && fieldCounter > 0) {
                fieldCounter++;
                dataArray.push(fieldCounter);
                fieldCounter = 0;
            }
        }
    }
    var firstElement = dataArray[0]
    for (var i = 0; i > dataArray.length; i++) {
        if (dataArray[i] !== firstElement) {
            throw new Error("Некорректный файл!");
        }
    }
    return new Array(dataArray.length, firstElement);
}

function rectAddExpressions(comp, name, sizeExp, positionExp, scaleExp, anchorExp) { 
            //strokeColorExp, fillColorExp, fillColorOpacityExp, opacityExp) {
    var layer = comp.layers.byName(name);
    
    // if (opacityExp !== "") {
    //     layer.property("Opacity").expression = opacityExp;
    // }

    if (name !== "1-1") {
        layer.property("Position").expression = positionExp;
    }

    layer.property("Anchor Point").expression = anchorExp;
    layer.property("Scale").expression = scaleExp;
    
    var shapeGroup = layer.property("Contents").property("ADBE Vector Group");
    
    var rect = shapeGroup.property("Contents").property("ADBE Vector Shape - Rect");
    rect.property("Size").expression = sizeExp;
    // rect.property("Position").expression = positionExp;
    // rect.property("Roundness").expression = roundnessExp;
    
    // var rectStroke = shapeGroup.property("Contents").property("ADBE Vector Graphic - Stroke");
    // rectStroke.property("Color").expression = strokeColorExp;
    // rectStroke.property("Stroke Width").expression = strokeExp;

    // var rectFill = shapeGroup.property("Contents").property("ADBE Vector Graphic - Fill");
    // rectFill.property("Color").expression = fillColorExp;
    // rectFill.property("Opacity").expression = fillColorOpacityExp;
}

function addNewNull(comp, name, scaleExp, positionExp) {
    var nullLayer = comp.layers.addNull();
    nullLayer.name = name;
    if (scaleExp !== "") {
        nullLayer.property("Scale").expression = scaleExp;
    }
    if (positionExp !== "") {
        nullLayer.property("Position").expression = positionExp;
    }
    return nullLayer;
}

function addSlider(comp, layer, name, value, showName, exp) {
    var slider = layer.property("Effects").addProperty("ADBE Slider Control");
    slider.name = name;
    slider.property("Slider").setValue(value);
    if (showName !== "") {
        slider.property("Slider").addToMotionGraphicsTemplateAs(comp, showName);
    }
    if (exp !== "") {
        slider.property("Slider").expression = exp;
    }
}

function limitNum(num, limit) {
    return num <= limit ? num : limit;
}

function addPointControl(layer, name, position, dimensions) {
    const expressions = {
        firstPoint: "var p = thisComp.layer(\"1-1\").transform.position;\n" + 
                "[p[0], p[1]]",
        // points: "var thisNum = " + (name - 1).toString() + ";\n" + 
        //         "var multiplier = effect(\"multiplier\")(\"Slider\");\n" + 
        //         "var x = effect(\"y" + limitNum(name, dimensions[0]).toString() + "\")(\"Slider\") * multiplier;\n" + 
        //         "var y = effect(\"x" + limitNum(name, dimensions[1]).toString() + "\")(\"Slider\") * multiplier;\n" + 
        //         "var gap = effect(\"gap\")(\"Slider\");\n" + 
        //         "var prevCoords = effect(`point_${thisNum}`)(\"Point\");\n" + 
        //         "[x + gap + prevCoords[0], y + gap + prevCoords[1]];",
        newPoints: "var num = " + (name - 1).toString() + ";\n" + 
                "var prev = effect(`point_${num}`)(\"Point\")\n" + 
                "var col = effect(\"column_" +  limitNum(name, dimensions[0]).toString() + "\")(\"Slider\");\n" + 
                "var row = effect(\"row_" + limitNum(name, dimensions[1]).toString() + "\")(\"Slider\");\n" + 
                "var aGap = effect(\"gap\")(\"Slider\");\n" + 
                "[prev[0] + col * 10 + aGap, prev[1] + row * 10 + aGap];"
    }

    var pControl = layer.property("Effects").addProperty("ADBE Point Control");
    pControl.name = "point_" + name.toString();
    pControl.property("Point").setValue(position);
    if (name === 1) {
        pControl.property("Point").expression = expressions.firstPoint;
    } else {
        pControl.property("Point").expression = expressions.newPoints;
    }
}

function writeBaseProp(layer, property, expression) {
    if (expression !== "") {
        layer.property(property).expression = expression;
    } 
}

function addTextField(comp, name, text, sourceExp, positionExp) {
    var aText = comp.layers.addText(text);
    aText.name = name;

    writeBaseProp(aText, "Position", positionExp);

    if (sourceExp !== "") {
        var t = aText.property("Text").property("Source Text");
        t.expression = sourceExp;
    }
}

function createTable(rows, columns, csv, compID, isHorizHeader, isVertHeader) {
    const comp = app.project.itemByID(compID);
    const mainNull = addNewNull(comp, "mainNull", "[100, 100]", "[100, 100]");

    const expressions = {
        textPosition: "try { \n" + 
                "    var n = thisLayer.name.split(\"-\");\n" + 
                "    var cel = thisComp.layer(`${n[1]}-${n[2]}`).content(\"Group 1\").content(\"Rectangle Path 1\").size;\n" + 
                "    var pos = thisComp.layer(`${n[1]}-${n[2]}`).transform.position;\n" + 
                "    [pos[0] + cel[0] / 2, pos[1] + cel[1] / 2];\n" + 
                "} catch (e) {\n" + 
                "    [-200, 0];\n" + 
                "}",

        cellSize: "var coords = effect(\"cellCoordinates\")(\"Point\");\n" +
                "var cellSize = effect(\"cellSize\")(\"Point\");\n" +
                "function newSize(direction) {\n" +
                "    var axis = direction === 0 ? \"column_\" : \"row_\";\n" +
                "    var d = cellSize[direction];\n" +
                "    var x = 0;\n" +
                "    for (var i = 0; i < d; i++) {\n" +
                "        x += thisComp.layer(\"" + mainNull.name + "\").effect(`${axis}${coords[direction] + i}`)(\"Slider\");\n" +
                "    }\n" +
                "    return x * 10 + thisComp.layer(\"" + mainNull.name + "\").effect(\"gap\")(\"Slider\") * (cellSize[direction] - 1);\n" +
                "}\n" +
                "[newSize(0), newSize(1)];",

        cellAnchor: "var p = content(\"Group 1\").content(\"Rectangle Path 1\").size;\n" + 
                "[p[0] / 2 * -1, p[1] / 2 * -1];",

        cellPosition: "coords = effect(\"cellCoordinates\")(\"Point\");\n" +
                "[thisComp.layer(\"" + mainNull.name + "\").effect(`point_${coords[1]}`)(\"Point\")[0], " + 
                "thisComp.layer(\"" + mainNull.name + "\").effect(`point_${coords[0]}`)(\"Point\")[1]]",
        
        // "var coords = effect(\"cellCoordinates\")(\"Point\");\n" +
        //         "var x = thisComp.layer(\"" + mainNull.name + "\").effect(`point_${coords[0]}`)(\"Point\")[1];\n" +
        //         "var y = thisComp.layer(\"" + mainNull.name + "\").effect(`point_${coords[1]}`)(\"Point\")[0];\n" +
        //         "[x, y];", 

        cellScale: "[100, 100];",

    }


    var tableDimensions = new Array();

    if (csv || csv !== "") {
        var csvFile = new File(csv);

        try {

            var projData = app.project.importFile(new ImportOptions(csvFile));
            var aFile = comp.layers.add(projData);
            // ADBE Data Group ADBE DataLayer Num Rows
            var data = aFile.property("ADBE Data Group").property("ADBE DataLayer Num Rows");
            processProperty(data)


            var tempArray = csv.toLowerCase().split(".");
            var extension = tempArray[tempArray.length - 1];
            var separator;

            if (extension === "csv") {
                separator = ",";
            } else if (extension === "tsv" || extension === "txt") {
                separator = "\t";
            } else {
                separator = ";";
            }

            csvFile.open("r");            
            var data = csvFile.read();
            tableDimensions = csvData(data, separator);

            csvFile.close();

            //if (data.length < 2 || line.length < 2) {
            //    throw new Error("Некорректный файл!"); // not sure this is necessary
            //}

        //tableDimensions = [data.length, line.length];

        } catch (err) {
            alert("Некорректный файл!");
        }
    } else {
        tableDimensions = [rows, columns];
    }

    var dotsQuantity = Math.max(tableDimensions[0], tableDimensions[1]);

    for (var i = 1; i <= dotsQuantity; i++) {
        addPointControl(mainNull, i, [-100, -100], tableDimensions);
    }

    addSlider(comp, mainNull, "gap", 10, "Зазор", "");
    addSlider(comp, mainNull, "multiplier", 10, "", "");

    for (var i = 1; i <= tableDimensions[0]; i++) {
        addSlider(comp, mainNull, "row_" + i.toString(), 10, "Строка " + i.toString(), "");
    }

    for (var i = 1; i <= tableDimensions[1]; i++) {
        addSlider(comp, mainNull, "column_" + i.toString(), 40, "Столбец " + i.toString(), "");
    }

    for (var i = 1; i <= tableDimensions[1]; i++) {
        for (var j = 1; j <= tableDimensions[0]; j++) {
            var cellName = i.toString() + "-" + j.toString();
            addRectangle(comp, cellName, [400, 150], [0.1, 0.3, 0.1], 100, 3, 
                [0.1, 0.1, 0.3], 100, [100, 100]);
            rectAddExpressions(comp, cellName, expressions.cellSize, expressions.cellPosition, 
                expressions.cellScale, expressions.cellAnchor);
        }
    }

    // for (var i = 1; i <= tableDimensions[1]; i++) {
    //     for (var j = 0; j < tableDimensions[0]; j++) {
    //         if (j === 0) {
                
    //             addTextField(comp,"t-" + i.toString() + "-" + (j + 1).toString(), "cellData", 
    //             "thisComp.layer(\"" + filename + "\")(\"Data\")(\"Outline\")(" + i.toString() + ")", expressions.textPosition);
    //         } else {
    //             addTextField(comp,"t-" + i.toString() + "-" + (j + 1).toString(), "cellData", 
    //             "thisComp.layer(\"" + filename + "\")(\"Data\")(\"Outline\")(" + i.toString() + ")(" + j.toString() + ")", expressions.textPosition);
    //         }
    //     }
    // }

    var fld = app.project.file.fsName;
    log(fld);
    log(compID);
    log(tableDimensions);
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
            createTable(rowsNum, columnsNum, fileAddress.text, 
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