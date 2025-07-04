﻿/**
table todo:
    1. Анимация!
    2. Парсить CSV и записывать данные прямо в текстовые поля
    
*/

function processProperty(theProp) {
    if (theProp.propertyType == PropertyType.PROPERTY) {
        try {
            log(theProp.name + " " + "---" + theProp.matchName + "---" + " " + theProp.value);
        } catch (e) {
            log(theProp.name + " " + "NO VALUE");
        }
        if (theProp.matchName === "ADBE Text Animators") {
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
    /*
    var logFile = File("e:/logfile.txt");
    logFile.open("a");
    logFile.writeln(input);
    logFile.close(); */
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
    var firstElement = dataArray[0];
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
    
    if (name !== "1-1") {
        layer.property("Position").expression = positionExp;
    }

    layer.property("Anchor Point").expression = anchorExp;
    layer.property("Scale").expression = scaleExp;
    
    var shapeGroup = layer.property("Contents").property("ADBE Vector Group");
    
    var rect = shapeGroup.property("Contents").property("ADBE Vector Shape - Rect");
    rect.property("Size").expression = sizeExp;
}

function rectAddAnimation(comp, name, typeAnim, direction, speed, position, bias, diff, correction) {

    var opposingDirection = -1;
    var layer = comp.layers.byName(name);
    var opacity = layer.property("Opacity");

    if (direction[0] + direction[1] > 0) {
        var inKey = (position[0] - 1) * direction[0] * diff + (position[1] - 1) * direction[1] * diff;
    } else if (direction[0] + direction[1] > -1) {
        var inKey = (position[0] - 1) * direction[0] * diff + (position[1] - 1) * direction[1] * diff + correction * diff;
    } else {
        var inKey = (position[0] - 1) * direction[0] * diff + (position[1] - 1) * direction[1] * diff + correction * diff * 2;
    }

    var outKey = inKey + speed * 0.1;
    var rectInitCoord = [bias * direction[1] * opposingDirection, bias * direction[0] * opposingDirection];
    
    var easeIn = new KeyframeEase(0, 35);
    var easeOut = new KeyframeEase(0, 35);

    opacity.addKey(inKey);
    opacity.addKey(outKey);

    opacity.setValueAtKey(1, 0);
    opacity.setValueAtKey(2, 100);
    
    opacity.setTemporalEaseAtKey(1, [easeIn]);
    opacity.setTemporalEaseAtKey(2, [easeOut]);

    var rectPosition = layer.property("ADBE Root Vectors Group")
                .property("ADBE Vector Group")
                .property("ADBE Vector Transform Group")
                .property("ADBE Vector Position");
    
    rectPosition.addKey(inKey);
    rectPosition.addKey(outKey);
    
    rectPosition.setValueAtKey(1, rectInitCoord);
    rectPosition.setValueAtKey(2, [0, 0]);
    
    rectPosition.setTemporalEaseAtKey(1, [easeIn]);
    rectPosition.setTemporalEaseAtKey(2, [easeOut]);
    
    var rectScale = layer.property("ADBE Root Vectors Group")
                .property("ADBE Vector Group")
                .property("ADBE Vector Transform Group")
                .property("ADBE Vector Scale");

    rectScale.addKey(inKey);
    rectScale.addKey(outKey);

    rectScale.setValueAtKey(1, [50, 50]);
    rectScale.setValueAtKey(2, [100, 100]);
    
    rectScale.setTemporalEaseAtKey(1, [easeIn, easeIn]);
    rectScale.setTemporalEaseAtKey(2, [easeOut, easeOut]);

}

function textAddAnimation(comp, name, typeAnim, direction, speed, position, bias, diff, correction) {

    var layer = comp.layers.byName(name);
    var opacity = layer.property("Opacity");
    var textScale = layer.property("Scale");
    
    if (direction[0] + direction[1] > 0) {
        var inKey = (position[0] - 1) * direction[0] * diff + (position[1] - 1) * direction[1] * diff;
    } else if (direction[0] + direction[1] > -1) {
        var inKey = (position[0] - 1) * direction[0] * diff + (position[1] - 1) * direction[1] * diff + correction * diff;
    } else {
        var inKey = (position[0] - 1) * direction[0] * diff + (position[1] - 1) * direction[1] * diff + correction * diff * 2;
    }

    var outKey = inKey + speed * 0.1;
    var textInitCoord = [bias * direction[1] , bias * direction[0], 0];
    
    var easeIn = new KeyframeEase(0, 35);
    var easeOut = new KeyframeEase(0, 35);

    opacity.addKey(inKey);
    opacity.addKey(outKey);
    opacity.setValueAtKey(1, 0);
    opacity.setValueAtKey(2, 100);
    
    opacity.setTemporalEaseAtKey(1, [easeIn]);
    opacity.setTemporalEaseAtKey(2, [easeOut]);
    
    textScale.addKey(inKey);
    textScale.addKey(outKey);
    textScale.setValueAtKey(1, [50, 50]);
    textScale.setValueAtKey(2, [100, 100]);
    
    textScale.setTemporalEaseAtKey(1, [easeIn, easeIn, easeIn]);
    textScale.setTemporalEaseAtKey(2, [easeOut, easeOut, easeOut]);    
    
    var animPos = layer.Text.Animators.addProperty("ADBE Text Animator");
    var textPos = animPos.property("ADBE Text Animator Properties").addProperty("ADBE Text Position 3D");
    textPos.addKey(inKey);
    textPos.addKey(outKey);
    textPos.setValueAtKey(1, textInitCoord);
    textPos.setValueAtKey(2, [0, 0, 0]);
    
    textPos.setTemporalEaseAtKey(1, [easeIn]);
    textPos.setTemporalEaseAtKey(2, [easeOut]);
    
    
    //var tPos = layer.addProperty("ADBE Text Animators") //.addProperty("ADBE Text Position 3D");
    //var tScale = layer.addProperty("ADBE Text Scale 3D");
    
    //processProperty(layer);
    
        /*
            
            .property("ADBE Transform Group").property("ADBE Position")
    
    ADBE Transform Group
    ADBE Position
    
    */
    
    // processProperty(position)
    
    
    
    
    
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

        newPoints: "var num = " + (name - 1).toString() + ";\n" + 
                "var prev = effect(`point_${num}`)(\"Point\")\n" + 
                "var row = effect(`col_${num}`)(\"Slider\");\n" +
                "var col = effect(`row_${num}`)(\"Slider\");\n" +
                "var aGap = effect(\"gap\")(\"Slider\");\n" + 
                "[prev[0] + row * 10 + aGap, prev[1] + col * 10 + aGap];"
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

function createTable(rows, columns, csv, compID, animValue, biasValue, distValue, directionComboValue) {
    const comp = app.project.itemByID(compID);
    const mainNull = addNewNull(comp, "mainNull", "[100, 100]", "[100, 100]");
    
    const diff = biasValue / 250;
    const directions = [[1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [0, 0]];
    const direction = directions[directionComboValue];
    const animationType = 0;
    const animSpeed = animValue * 0.1;
    
    if (csv || csv !== "") {
        var csvLoaded = true;
    } else {
        var csvLoaded = false;
    }

    const expressions = {
        textPosition: "try { \n" + 
                "    var n = thisLayer.name.split(\"-\");\n" + 
                "    var cel = thisComp.layer(`${n[1]}-${n[2]}`).content(\"Group 1\").content(\"Rectangle Path 1\").size;\n" + 
                "    var pos = thisComp.layer(`${n[1]}-${n[2]}`).transform.position;\n" + 
                "    [pos[0] + cel[0] / 2, pos[1] + cel[1] / 2];\n" + 
                "} catch (e) {\n" + 
                "    [-200, -200];\n" + 
                "}",

        cellSize: "var coords = effect(\"cellCoordinates\")(\"Point\");\n" +
                "var cellSize = effect(\"cellSize\")(\"Point\");\n" +
                "function newSize(direction) {\n" +
                "    var axis = direction === 0 ? \"row_\" : \"col_\" ;\n" +
                "    var d = cellSize[direction];\n" +
                "    var x = 0;\n" +
                "    for (var i = 0; i < d; i++) {\n" +
                "        x += thisComp.layer(\"" + mainNull.name + "\").effect(`${axis}${coords[direction] + i}`)(\"Slider\");\n" +
                "    }\n" +
                "    return x * 10 + thisComp.layer(\"" + mainNull.name + "\").effect(\"gap\")(\"Slider\") * (cellSize[direction] - 1);\n" +
                "}\n" +
                "[newSize(1), newSize(0)];",
        
        cellAnchor: "var p = content(\"Group 1\").content(\"Rectangle Path 1\").size;\n" + 
                "[p[0] / 2 * -1, p[1] / 2 * -1];",

        cellPosition: "coords = effect(\"cellCoordinates\")(\"Point\");\n" +
                "[thisComp.layer(\"" + mainNull.name + "\").effect(`point_${coords[1]}`)(\"Point\")[0], " + 
                "thisComp.layer(\"" + mainNull.name + "\").effect(`point_${coords[0]}`)(\"Point\")[1]]",

        cellScale: "[100, 100];",

    }

    var tableDimensions = new Array();

    if (csvLoaded) {
        var csvFile = new File(csv);

        try {
            var projData = app.project.importFile(new ImportOptions(csvFile));
            var aFile = comp.layers.add(projData);
            var data = aFile.property("ADBE Data Group").property("ADBE DataLayer Num Rows");
            processProperty(data)


            var tempArray = csv.split("\\");
            var filename = tempArray[tempArray.length - 1];
            var tmpExtension = filename.toLowerCase().split(".");
            var extension = tmpExtension[tmpExtension.length - 1]
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

    addSlider(comp, mainNull, "gap", 0, "Зазор", ""); /////////////////
    addSlider(comp, mainNull, "multiplier", 10, "", "");

    for (var i = 1; i <= dotsQuantity; i++) {
        addSlider(comp, mainNull, "col_" + i.toString(), 40, "Столбец " + i.toString(), ""); //////////////////////
        addSlider(comp, mainNull, "row_" + i.toString(), 10, "Строка " + i.toString(), "");
    }


    for (var i = 1; i <= tableDimensions[0]; i++) {
        for (var j = 1; j <= tableDimensions[1]; j++) {
            var cellName = i.toString() + "-" + j.toString();
            var textName = "t-" + cellName;
            addRectangle(comp, cellName, [400, 150], [0.95, 0.95, 0.95], 100, 3, 
                [0.2, 0.2, 0.2], 100, [100, 100]);
            rectAddExpressions(comp, cellName, expressions.cellSize, expressions.cellPosition, 
                expressions.cellScale, expressions.cellAnchor);
            rectAddAnimation(comp, cellName, animationType, direction, animSpeed, [i, j], distValue, diff, dotsQuantity)
            

            if (csvLoaded) { 
                if (j === 0) {
                    addTextField(comp, textName, "cellData", 
                    "thisComp.layer(\"" + filename + "\")(\"Data\")(\"Outline\")(" + j.toString() + ")", expressions.textPosition);
                } else {
                    addTextField(comp, textName, "cellData", 
                    "thisComp.layer(\"" + filename + "\")(\"Data\")(\"Outline\")(" + j.toString() + ")(" + i.toString() + ")", expressions.textPosition);
                }
            } else {
                addTextField(comp, textName, "cellText", "", expressions.textPosition);
            }
            textAddAnimation(comp, textName, animationType, direction, animSpeed, [i, j], distValue, diff, dotsQuantity);
        }
    }

}

function promptWindow() {
    
    var comp = app.project.activeItem;
    
    var selectedSeq = 0;

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

/*
    var tabStyles = tabs.add("tab", undefined, undefined, {name: "Стили таблицы"}); 
    tabStyles.text = "Стили таблицы"; 
    tabStyles.orientation = "column"; 
    tabStyles.alignChildren = ["left","top"]; 
    tabStyles.spacing = spacings; 
    tabStyles.margins = margins; */

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
    headerPanel.preferredSize.height = elHeight * 2; 
    headerPanel.preferredSize.width = 150; 
    headerPanel.orientation = "row"; 
    headerPanel.alignChildren = ["right","center"]; 
    headerPanel.spacing = spacings; 
    headerPanel.margins = margins; 

    var tableHeaderSelect = topGroup.add("panel", undefined, undefined, {name: "tableHeaderSelect"});
    tableHeaderSelect.text = "Настройки таблицы:"; 
    tableHeaderSelect.preferredSize.height = elHeight * 2; 
    tableHeaderSelect.preferredSize.width = elMaxWidth - 200;
    tableHeaderSelect.orientation = "column"; 
    tableHeaderSelect.alignChildren = ["right","center"]; 
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

    //var animSlider = tableHeaderSelect.add("slider", 40, 0, 100);

    //var biasSlider = tableHeaderSelct.add("slider", 40, 0, 100);

    var droplist = [
        "Сверху слева - вниз вправо",
        "Сверху вниз",
        "Сверху справа - вниз влево",
        "Справа налево",
        "Снизу справа - вверх влево",
        "Снизу вверх",
        "Снизу слева - вверх вправо",
        "Слева направо",
        "Без движения"
    ]
    
    var group1 = tableHeaderSelect.add("group", undefined, {name: "group1"}); 
    group1.orientation = "row"; 
    group1.preferredSize.width = 245;
    group1.alignChildren = ["right","center"]; 
    group1.spacing = 15; 
    group1.margins = 0; 

    var statictext1 = group1.add("statictext", undefined, undefined, {name: "statictext1"}); 
    statictext1.text = "Время анимации:"; 

    var sliderAnimation = group1.add("slider", undefined, undefined, undefined, undefined, {name: "sliderAnimation"}); 
    sliderAnimation.minvalue = 0; 
    sliderAnimation.maxvalue = 100; 
    sliderAnimation.value = 40; 
    sliderAnimation.preferredSize.width = 160; 
    sliderAnimation.alignment = ["right","top"]; 
    
    var textSliderAnim = group1.add("statictext", undefined, undefined, {name: "textSliderAnim"}); 
    textSliderAnim.text = sliderAnimation.value; 
    textSliderAnim.preferredSize.width = 30;
    
    sliderAnimation.onChanging = function () {
        textSliderAnim.text = sliderAnimation.value; 
    }

    var group2 = tableHeaderSelect.add("group", undefined, {name: "group2"}); 
    group2.orientation = "row"; 
    group2.preferredSize.width = 245;
    group2.alignChildren = ["right","center"]; 
    group2.spacing = 10; 
    group2.margins = 0; 

    var statictext2 = group2.add("statictext", undefined, undefined, {name: "statictext2"}); 
    statictext2.text = "Время задержки:"; 

    var sliderBias = group2.add("slider", undefined, undefined, undefined, undefined, {name: "sliderBias"}); 
    sliderBias.minvalue = 0; 
    sliderBias.maxvalue = 100; 
    sliderBias.value = 24; 
    sliderBias.preferredSize.width = 160; 
    sliderBias.alignment = ["right","top"]; 
    
    var textSliderBias = group2.add("statictext", undefined, undefined, {name: "textSliderBias"}); 
    textSliderBias.text = sliderBias.value; 
    textSliderBias.preferredSize.width = 30;
    
    sliderBias.onChanging = function () {
        textSliderBias.text = sliderBias.value; 
    }
    
    var group3 = tableHeaderSelect.add("group", undefined, {name: "group2"}); 
    group3.orientation = "row"; 
    group3.preferredSize.width = 245;
    group3.alignChildren = ["right","center"]; 
    group3.spacing = 10; 
    group3.margins = 0; 

    var statictext3 = group3.add("statictext", undefined, undefined, {name: "statictext3"}); 
    statictext3.text = "Расстояние:"; 

    var sliderDist = group3.add("slider", undefined, undefined, undefined, undefined, {name: "sliderDist"}); 
    sliderDist.minvalue = 0; 
    sliderDist.maxvalue = 1000; 
    sliderDist.value = 150; 
    sliderDist.preferredSize.width = 160; 
    sliderDist.alignment = ["right","top"]; 
    
    var textSliderDist = group3.add("statictext", undefined, undefined, {name: "textSliderDist"}); 
    textSliderDist.text = sliderDist.value; 
    textSliderDist.preferredSize.width = 30;
    
    sliderDist.onChanging = function () {
        textSliderDist.text = sliderDist.value; 
    }
    
    var group4 = tableHeaderSelect.add("group", undefined, {name: "group3"}); 
    group4.orientation = "row"; 
    group4.preferredSize.width = 245;
    group4.alignChildren = ["right","center"]; 
    group4.spacing = 10; 
    group4.margins = 0; 
    
    var statictext2 = group4.add("statictext", undefined, undefined, {name: "statictext3"}); 
    statictext2.text = "Направление:"; 

    var dropDirectionMenu = group4.add("dropdownlist", undefined, droplist);
    dropDirectionMenu.selection = 0;

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
        for (i=0; i < comps.length; i++) {
            if (comps[i] == comp.name) {
                selectedSeq = i;
            }
        }
        dropMenu.selection = selectedSeq;
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
        var selectedComp = dropMenu.selection.index;
        var selectedID = compIDs[selectedComp];
        if (fileIsSelected || (rowsNum >= 1 && columnsNum >= 1)) {
            createTable(rowsNum, columnsNum, fileAddress.text, 
                selectedID, sliderAnimation.value, sliderBias.value, sliderDist.value, dropDirectionMenu.selection.index);
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
