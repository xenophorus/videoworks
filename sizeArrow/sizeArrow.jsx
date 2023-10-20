function processProperty(theProp) {
    if (theProp.propertyType == PropertyType.PROPERTY) {
        try {
            log(theProp.name + " " + theProp.value);
        } catch (e) {
            log(theProp.name + " " + "NO VALUE");
        }
        //if (theProp.name === "Skew Axis") {
        //    log(1);
        //}
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

function setPathExp(comp, layerName, begin, end) {
    var exp = "offset = [thisComp.width, thisComp.height]/2\n" + 
            "p1 = thisComp.layer(\"" + begin + "\").toComp([0,0]).slice(0,2)\n" + 
            "p2 = thisComp.layer(\"" + end + "\").toComp([0,0]).slice(0,2)\n" + 
            "ps = [p1, p2]\n" + 
            "in_tangents = []\n" + 
            "out_tangents = []\n" + 
            "createPath(ps, in_tangents, out_tangents, is_closed=false)"

    var path = comp.layers.byName(layerName)
                .property("ADBE Root Vectors Group")
                .property("ADBE Vector Group")
                .property("ADBE Vectors Group")
                .property("ADBE Vector Shape - Group")
                .property("ADBE Vector Shape");
    
    path.expression = exp;
}


function setLineLength(comp, layerName, exp) {
    var trim = comp.layers.byName(layerName)
                .property("ADBE Root Vectors Group")
                .property("ADBE Vector Group")
                .property("ADBE Vectors Group")
                .property("ADBE Vector Filter - Trim");
    var trimStart = trim.property("ADBE Vector Trim Start");
    trimStart.expression = exp;
}

function addCheckBox(comp, layer, name, showName) {
    var chBox = layer.property("Effects").addProperty("ADBE Checkbox Control");
    chBox.name = name;
    chBox.property("Checkbox").setValue(true);
    chBox.property("Checkbox").addToMotionGraphicsTemplateAs(comp, showName);
}

function addSlider(comp, layer, name, value, showName) {
    var slider = layer.property("Effects").addProperty("ADBE Slider Control");
    slider.name = name;
    slider.property("Slider").setValue(value);
    if (showName !== "") {
        slider.property("Slider").addToMotionGraphicsTemplateAs(comp, showName);
    }
}

function addAngleControl(layer, name, value) {
    var eff = layer.property("Effects");
    var angleControl = eff.addProperty("ADBE Angle Control");
    angleControl.name = name;
    angleControl.property("Angle").setValue(value);

}

function addColorControl(comp, layer, name, color, showName) {
    var colorControl = layer.property("Effects").addProperty("ADBE Color Control");
    colorControl.name = name;
    colorControl.property("Color").setValue(color);
    colorControl.property("Color").addToMotionGraphicsTemplateAs(comp, showName);
}

function addDropDownMenu(layer, name, arrayOfStrings) {
    var ddMenu = layer.property("Effects").addProperty("ADBE Dropdown Control");
    ddMenu.name = name;
    var menu = ddMenu.property("Menu");
    menu.setPropertyParameters(arrayOfStrings);
    //menu.addToMotionGraphicsTemplateAs(comp, showName);

}

function attachCheckBox(comp, name, baseNull) {
    var layerOpacity = comp.layers.byName(name).property("Opacity");
    layerOpacity.expression = "transform.opacity = 100 * thisComp.layer(\"" + baseNull + "\").effect(\"" + name + "Switch\")(\"Checkbox\");"
}

function addToMGT(comp, name, rusName, baseNull) {
    comp.layers.byName(baseNull).property("Effects").property(name)
        .property("ADBE Slider Control-0001")
        .addToMotionGraphicsTemplate(comp, rusName);
}

function addNumToName(name, num) {
    return name + "_" + num;
}

function addTextField(comp, name, text, showName, 
    rotationExp, opacityExp, anchorExp, sourceExp, positionExp,
    visible) {
    //rotationExp, switchExp, anchorExp, sourceExp,
    var aText = comp.layers.addText(text);
    aText.name = name;
    if (rotationExp !== "") {
        aText.property("Rotation").expression = positionExp;
    }
    if (anchorExp !== "") {
        aText.property("Anchor Point").expression = anchorExp;
    }
    if (opacityExp !== "") {
        aText.property("Opacity").expression = opacityExp;
    }
    if (sourceExp !== "") {
        var t = aText.property("Text").property("Source Text");
        t.expression = sourceExp;
    }
    if (visible) {
        aText.property("Opacity").setValue(100);
    } else {
        aText.property("Opacity").setValue(0);
    }
    if (showName !== "") {
        aText.property("ADBE Text Properties").property("ADBE Text Document")
            .addToMotionGraphicsTemplateAs(comp, showName);
    }
}

function createShape(vertices, inTangents, outTangents, closed) {
    var myShape = new Shape();
    myShape.vertices = vertices;
    myShape.inTangents = inTangents;
    myShape.outTangents = outTangents;
    myShape.closed = closed;
    return myShape;
}

function addShapeToLayer(comp, name, shape, color, opacity, stroke, position, colorExp, rotationExp, center) {

    var layer = comp.layers.addShape();
    layer.name = name;
    var shapeGroup = layer.property("Contents").addProperty("ADBE Vector Group");
    var lineShape = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Group");
    var linePath = lineShape.property("Path");
    linePath.setValue(shape);
    
    var lineStroke =  shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    lineStroke.property("Color").setValue(color);
    lineStroke.property("Opacity").setValue(opacity);
    lineStroke.property("Stroke Width").setValue(stroke);

    if (colorExp !== "") {
        lineStroke.property("Color").expression = colorExp;
    }

    if (rotationExp !== "") {
        layer.transform.rotation.expression = rotationExp;
    }

    if (center === true) {
        centerAnchorPoint(layer);
    } else {
        layer.anchorPoint.setValue([0, 0]);
    }

    layer.transform.position.setValue(position);
    layer.moveToEnd();
}

function createSizeArrow(comp, num) {

    const mainNull = addNumToName("mainNull", num);
    const lineTop = addNumToName("lineTop", num);
    const lineBottom = addNumToName("lineBottom", num);
    const lineExtTop = addNumToName("lineExtTop", num);
    const lineExtBottom = addNumToName("lineExtBottom", num);
    const lineCenter = addNumToName("lineCenter", num);
    const shelfPoint = addNumToName("shelfPoint", num);
    const shelfPointExt = addNumToName("shelfPointExt", num);

    expressions = {
        //mainNull
        "radian": "const anchor1 = thisComp.layer(\"" + lineTop + "\").transform.position;\n" + 
                "const anchor2 = thisComp.layer(\"" + lineBottom + "\").transform.position;\n" + 
                "const coord = [(anchor1[0] - anchor2[0]).toFixed(2) * -1, (anchor1[1] - anchor2[1]).toFixed(2)];\n" + 
                "const rad = Math.atan2(coord[0], coord[1]);\n" + 
                "effect(\"radian\")(\"Slider\").value = rad;",

        "angle": "const rad = effect(\"radian\")(\"Slider\").value;\n" + 
                "const angle = (rad * (180 / Math.PI)).toFixed(2);\n" + 
                "effect(\"Angle Control\")(\"angle\").value = angle;", 
        //nulls
        "centerPoint": "var p1 = thisComp.layer(\"" + lineTop + "\").transform.position;\n" + 
                "var p2 = thisComp.layer(\"" + lineBottom + "\").transform.position;\n" + 
                "[(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]",

        //textExps
        "textSource": "const ln = thisComp.layer(\"" + mainNull + "\").effect(\"numToLabel\")(\"Slider\")\n" +
                "const lbl = (thisComp.layer(\"quantity\").text.sourceText.value * (ln / 100)).toFixed(thisComp.layer(\"" + mainNull + "\").effect(\"pointSigns\")(\"Slider\").value);\n" +
                "text.sourceText.style.setText(`${lbl} ${thisComp.layer(\"points\").text.sourceText}`).setFontSize(thisComp.layer(\"" + mainNull + "\").effect(\"fontSize\")(\"Slider\"));",

        "textAnchor1": "const s = thisComp.layer(\"mainLabel\");\n" +
                "const w = s.sourceRectAtTime().width / 2;\n" +
                "const h = s.sourceRectAtTime().height / 2;\n" +
                "const l = s.sourceRectAtTime().left;\n" +
                "const t = s.sourceRectAtTime().top;\n" +
                "[l + w, t + h];",
        "textAnchor2": "const s = thisComp.layer(\"mainLabel2\");\n" +
                "const w = s.sourceRectAtTime().width / 2;\n" +
                "const h = s.sourceRectAtTime().height / 2;\n" +
                "const l = s.sourceRectAtTime().left;\n" +
                "const t = s.sourceRectAtTime().top;\n" +
                "const a = thisComp.layer(\"" + mainNull + "\").effect(\"radian\")(\"Slider\").value;\n" +
                "const b = thisComp.layer(\"" + mainNull + "\").effect(\"lineBias\")(\"Slider\").value;\n" +
                "[l + w + 2 * b * Math.cos(a), t + h + b * Math.sin(a)];",
        "textAnchor3": "const s = thisComp.layer(\"mainLabel3\");\n" +
                "const w = s.sourceRectAtTime().width / 2;\n" +
                "const h = s.sourceRectAtTime().height / 2;\n" +
                "const l = s.sourceRectAtTime().left;\n" +
                "const t = s.sourceRectAtTime().top;\n" +
                "const b = thisComp.layer(\"" + mainNull + "\").effect(\"lineBias\")(\"Slider\").value;\n" +
                "[l + w, t + h + b];",  

        "textSwitch1": "const q = thisComp.layer(\"" + mainNull + "\").effect(\"Dropdown Menu Control\")(\"Menu\").value;\n" +
                "if (q === 1) {\n" +
                "    transform.opacity = 100;\n" +
                "    } else {\n" +
                "        transform.opacity = 0;\n" +
                "}",
        "textSwitch2": "const q = thisComp.layer(\"" + mainNull + "\").effect(\"Dropdown Menu Control\")(\"Menu\").value;\n" +
                "if (q === 2) {\n" +
                "    transform.opacity = 100;\n" +
                "    } else {\n" +
                "        transform.opacity = 0;\n" +
                "    }",
        "textSwitch3": "const q = thisComp.layer(\"" + mainNull + "\").effect(\"Dropdown Menu Control\")(\"Menu\").value;\n" +
                "if (q === 3) {\n" +
                "    transform.opacity = 100;\n" +
                "    } else {\n" +
                "        transform.opacity = 0;\n" +
                "}",

        "textRotation": "thisComp.layer(\"" + mainNull + "\").effect(\"Angle Control\")(\"Angle\") - 90;",
        "textPosition": "thisComp.layer(\"center\").transform.position;",

        //lines
        "strokeColor": "thisComp.layer(\"" + mainNull + "\").effect(\"Line Width\")(\"Slider\")",


        //arrow

    };

    nullNames = [mainNull, lineTop, lineBottom, lineCenter, 
        lineExtTop, lineExtBottom, shelfPoint, shelfPointExt];

    for (var i = 0; i < nullNames.length; i++) {
        addNewNull(comp, nullNames[i], "[100, 100]", "");
    }
    
    comp.layers.byName(lineCenter).transform.position.expression = expressions.centerPoint;

    var mainNullLayer = comp.layers.byName(mainNull);

    addAngleControl(mainNullLayer, "angle", 0);
    
    addSlider(comp, mainNullLayer, "radian", 0, "");
    addSlider(comp, mainNullLayer, "numToLabel", 100, "Слайдер для роста числа");
    addSlider(comp, mainNullLayer, "bias", 8, "Отклонение рамки от центра");
    addSlider(comp, mainNullLayer, "margins", 20, "Границы плашки");
    addSlider(comp, mainNullLayer, "roundness", 20, "Углы плашки, закругление");
    addSlider(comp, mainNullLayer, "strokeWidth", 3, "Границы плашки, толщина");
    addSlider(comp, mainNullLayer, "lineBias", 50, "Отклонение плашки от линии");
    addSlider(comp, mainNullLayer, "lineWidth", 5, "Толщина линии");
    addSlider(comp, mainNullLayer, "pointSigns", 1, "Количество знаков после запятой");
    addSlider(comp, mainNullLayer, "fontSize", 70, "Размер шрифта");

    addDropDownMenu(mainNullLayer, "labelType", ["Свободная", 
            "Привязанная без поворота", 
            "Привязанная с поворотом"]);
    mainNullLayer.property("Effects")
            .property("Dropdown Menu Control")
            .property("Menu")
            .addToMotionGraphicsTemplateAs(comp, "Тип плашки");

    addColorControl(comp, mainNullLayer, "fontColor", [0.9, 0.9, 0.9], "Цвет шрифта");
    addColorControl(comp, mainNullLayer, "labelFillColor", [0.1, 0.1, 0.1], "Цвет заливки плашки");
    addColorControl(comp, mainNullLayer, "labelStrokeColor", [0.9, 0.9, 0.9], "Цвет обводки плашки");
    addColorControl(comp, mainNullLayer, "lineColor", [0.9, 0.9, 0.9], "Цвет линий");

    addTextField(comp, "points", "см", "Единицы измерения", "", "", "", "", false);
    addTextField(comp, "quantity", 135, "Количество", "", "", "", "", false);
    addTextField(comp, "mainLabel", "mainLabel", "", "", expressions.textSwitch1, expressions.textAnchor1, 
                                    expressions.textSource, "", true);
    addTextField(comp, "mainLabel2", "mainLabel", "", "", expressions.textSwitch2, expressions.textAnchor2, 
                                    expressions.textSource, expressions.textPosition, true);
    addTextField(comp, "mainLabel3", "mainLabel", "", expressions.textRotation, expressions.textSwitch3, expressions.textAnchor3, 
                                    expressions.textSource, expressions.textPosition, true);

    var line = createShape([[100, 100], [300, 300]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], false);
    
    var lines = ["lineSize", "lineExtTop", "lineExtBottom", "lineShelf", "lineExtShelf"];

    for (i = 0; i < lines.length; i++) {
        addShapeToLayer(comp, lines[i], line, [0.9,0.9,0.9], 100, 5, [0, 0], expressions.strokeColor, "", false);

    }
    
    setPathExp(comp, "lineSize", lineTop, lineBottom);
    setPathExp(comp, "lineExtTop", lineTop, lineExtTop);
    setPathExp(comp, "lineExtBottom", lineBottom, lineExtBottom);
    setPathExp(comp, "lineShelf", lineCenter, shelfPoint);
    setPathExp(comp, "lineExtShelf", shelfPoint, shelfPointExt);


    var arrow = createShape([[0, 50], [20, 0], [40, 50], [20, 40]], 
                            [[0, 0], [0, 0], [0, 0], [0, 0]], 
                            [[0, 0], [0, 0], [0, 0], [0, 0]], true);

    addShapeToLayer(comp, "arrow1", arrow, [0.9,0.9,0.9], 100, 3, [0, 0], expressions.strokeColor, )

    

    



    /*
    Размерная линия 
        стрелки внутри/снаружи

        вынос размерного числа
            - то же, что и в коллауте?
            - 

        выносная линия
            - всегда перпендикулярна размерной?

        обозначение дуги/угла

    */

    /*
    центр
    стрелки от центра, анкор на острие? 
    вынос как продолжение размерной линии

    */
    

}

function main() {
    log("Starting at " + new Date().toTimeString() + "================================================");
    
    var baseComp = app.project.activeItem;

    if (baseComp instanceof CompItem) {
        var num = generateRandomNumber().toString().split(".")[1].slice(0, 6);
        var name = "sizeArrow_" + num;
        var newSizeArrow = app.project.items.addComp(name, 3840, 2160, 1, 60, 50);
    
        baseComp.layers.add(newSizeArrow);
        //newCallout.openInViewer();
        log("Composition " + name + " created");
        createSizeArrow(newSizeArrow, num);
        baseComp.layers.byName(name).moveToBeginning();
        //baseComp.layers.byName(name).locked = true;

        var nullNames = ["topNull", "bottomNull", "topArrowNull", "bottomArrowNull"];
        var nullPos = [[100, 100], [100, 600], [600, 100], [600, 600]];

        for (i = 0; i < nullNames.length; i++) {
            var nullName = addNumToName(nullNames[i], num);
            var newNull = addNewNull(baseComp, nullName, "[100, 100]", "");  
            newNull.transform.position.setValue(nullPos[i])
        }


        // var mainArrow = baseComp.layers.addNull();
        // mainArrow.name = "mainArrow" + num;
        // mainArrow.property("Scale").expression = "[100, 100]";
        // var mainCenter = baseComp.layers.addNull();
        // mainCenter.name = "mainCenter" + num;
        // mainCenter.property("Scale").expression = "[100, 100]";

        // var slaveCenter = newCallout.layers.byName("centerPoint_" + num);
        // var slaveArrow = newCallout.layers.byName("arrowPoint_" + num);

        // slaveCenter.moveToBeginning();
        // slaveArrow.moveToBeginning();
        
        // slaveArrow.property("Position").expression = "var x = comp(\"" + baseComp.name + "\").layer(\"" + mainArrow.name + "\").transform.position[0];\n" + 
        // "var y = comp(\"" + baseComp.name + "\").layer(\"" + mainArrow.name + "\").transform.position[1];\n" + 
        // "[x, y]";

        // slaveCenter.property("Position").expression = "var x = comp(\"" + baseComp.name + "\").layer(\"" + mainCenter.name + "\").transform.position[0];\n" + 
        // "var y = comp(\"" + baseComp.name + "\").layer(\"" + mainCenter.name + "\").transform.position[1];\n" + 
        // "[x, y]";
    } else {
        alert("Надо сначала выбрать нужную композицию, потом запускать скрипт!");
    }


}

main();