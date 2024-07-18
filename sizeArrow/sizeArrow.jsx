function processProperty(theProp) {
    if (theProp.propertyType == PropertyType.PROPERTY) {
        try {
            log(theProp.name + " " + theProp.value);
        } catch (e) {
            log(theProp.name + " " + "NO VALUE");
        }
        if (theProp.name === "Scale") {
            log(1);
        }
    } else {
        for (var i = 1; i <= theProp.numProperties; i++) {
            processProperty(theProp.property(i));
        }
    }
}


/**
 * TODO: 
 * 
 * добавить возможность смещения выносной линии относительно центра 
 * (так же смещать ее вниз, избавиться от хвостов?)
 * 
 */

/**
 * лечение уголков стрелок
 * X = a[0] - b[0]
 * Y = a[1] - b[1]
 * bias = outline.thickness
 * 
 * xModifier = X > 0 ? 1 : -1
 * yModifier = Y > 0 ? 1 : -1
 * pointDist = Math.sqrt(Math.pwr(X, 2) + Math.pwr(Y, 2))
 * 
 * xPerc = pointDist / X
 * yPerc = pointDist / Y
 * 
 * [pos[0] + bias * xPerc * xModifier, 
 * pos[1] + bias * yPerc * yModifier]
 * 
 */

function log(input) {
    $.writeln(input);
    // var logFile = File("e:/logfile.txt");
    // logFile.open("a");
    // logFile.writeln(input);
    // logFile.close();
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

function addAngleControl(layer, name, value, exp) {
    var eff = layer.property("Effects");
    var angleControl = eff.addProperty("ADBE Angle Control");
    angleControl.name = name;
    angleControl.property("Angle").setValue(value);
    if (exp !== "") {
        angleControl.property("Angle").expression = exp;
    }

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

function writeBaseProp(layer, property, expression) {
    if (expression !== "") {
        layer.property(property).expression = expression;
    } 
}

function addTextField(comp, name, text, showName, 
    rotationExp, opacityExp, anchorExp, sourceExp, positionExp,
    visible) {
    var aText = comp.layers.addText(text);
    aText.name = name;
    writeBaseProp(aText, "Rotation", rotationExp);
    writeBaseProp(aText, "Opacity", opacityExp);
    writeBaseProp(aText, "Anchor Point", anchorExp);
    writeBaseProp(aText, "Position", positionExp);

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

function addShapeToLayer(comp, name, shape, color, opacity, stroke, position, 
            strokeColorExp, strokeWidthExp, fillColorExp, rotationExp, center, anchorCoord) {

    var layer = comp.layers.addShape();
    layer.name = name;
    var shapeGroup = layer.property("Contents").addProperty("ADBE Vector Group");
    var lineShape = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Group");
    var linePath = lineShape.property("Path");
    linePath.setValue(shape);
    
    var lineStroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    lineStroke.property("Color").setValue(color);
    lineStroke.property("Opacity").setValue(opacity);
    lineStroke.property("Stroke Width").setValue(stroke);

    if (strokeColorExp !== "") {
        lineStroke.property("Color").expression = strokeColorExp;
    }

    if (strokeWidthExp !== "") {
        lineStroke.property("Stroke Width").expression = strokeWidthExp;
    }

    if (rotationExp !== "") {
        layer.transform.rotation.expression = rotationExp;
    }

    var lineFill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    lineFill.property("Color").expression = fillColorExp;

    if (center === true) {
        centerAnchorPoint(layer);
    } else {
        layer.transform.anchorPoint.setValue(anchorCoord);
    }

    layer.transform.position.setValue(position);
    layer.moveToEnd();
}

function addVisibilityExpression(comp, array, exp) {
    for (var i = 0; i < array.length; i++) {
        var layer = comp.layers.byName(array[i]);
        layer.property("Opacity").expression = exp;
    }
}

function addRectangle (comp, name, size, strokeColor, strokeOpacity, 
                    strokeWidth, fillColor, fillOpacity, position) {
    var rectangle = comp.layers.addShape();
    rectangle.name = name;
    var shapeGroup = rectangle.property("Contents").addProperty("ADBE Vector Group");
    var rect = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    rect.property("Size").setValue(size);

    var rectStroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    rectStroke.property("Color").setValue(strokeColor);
    rectStroke.property("Opacity").setValue(strokeOpacity);
    rectStroke.property("Stroke Width").setValue(strokeWidth);

    var rectFill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    rectFill.property("Color").setValue(fillColor);
    rectFill.property("Opacity").setValue(fillOpacity);
    
    rectangle.transform.position.setValue(position);
} 

function rectAddExpressions(comp, name, sizeExp, positionExp, roundnessExp, strokeExp, 
            strokeColorExp, fillColorExp, fillColorOpacityExp, opacityExp) {
    var layer = comp.layers.byName(name);
    
    if (opacityExp !== "") {
        layer.property("Opacity").expression = opacityExp;
    }
    layer.property("Anchor Point").expression = "thisComp.layer(\"mainLabel\").transform.anchorPoint";
    layer.property("Position").expression = "thisComp.layer(\"mainLabel\").transform.position";
    layer.property("Rotation").expression = "thisComp.layer(\"mainLabel\").transform.rotation";
    
    var shapeGroup = layer.property("Contents").property("ADBE Vector Group");
    
    var rect = shapeGroup.property("Contents").property("ADBE Vector Shape - Rect");
    rect.property("Size").expression = sizeExp;
    rect.property("Position").expression = positionExp;
    rect.property("Roundness").expression = roundnessExp;
    
    var rectStroke = shapeGroup.property("Contents").property("ADBE Vector Graphic - Stroke");
    rectStroke.property("Color").expression = strokeColorExp;
    rectStroke.property("Stroke Width").expression = strokeExp;

    var rectFill = shapeGroup.property("Contents").property("ADBE Vector Graphic - Fill");
    rectFill.property("Color").expression = fillColorExp;
    rectFill.property("Opacity").expression = fillColorOpacityExp;
}

function addTrimKeys(comp, layerName, effect, keys, values, isNewEff) {
    var vGroup = comp.layers.byName(layerName)
            .property("ADBE Root Vectors Group")
            .property("ADBE Vector Group")

    var trim;
    if (isNewEff) {
        trim = vGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Filter - Trim");
    } else {
        trim = vGroup.property("ADBE Vectors Group").property("ADBE Vector Filter - Trim");
    }
    var trimEff = trim.property("ADBE Vector Trim " + effect);
    trimEff.addKey(keys[0]);
    trimEff.addKey(keys[1]);
    trimEff.setValueAtKey(1, values[0]);
    trimEff.setValueAtKey(2, values[1]);
}

function addDeepKeys(comp, layerName, effect, keys, values) {
    var count = keys.length;
    var layer = comp.layers.byName(layerName)
            .property("ADBE Root Vectors Group")
            .property("ADBE Vector Group")
            .property("ADBE Vector Transform Group");
    processProperty(layer)
    
    var prop = layer
            .property("ADBE Vector " + effect);

    for (var i = 1; i <= count; i++) {
        prop.addKey(keys[i - 1]);
        prop.setValueAtKey(i, values[i - 1]);   
    }
}

function addKeys(comp, layerName, effect, keys, values) {
    var count = keys.length;
    var layer = comp.layers.byName(layerName).property(effect);

    for (var i = 1; i <= count; i++) {
        layer.addKey(keys[i - 1]);
        layer.setValueAtKey(i, values[i - 1]);   
    }
}

function createSizeArrow(baseCompName, comp, num) {

    const mainNull = addNumToName("mainNull", num);
    const lineTop = addNumToName("lineTop", num);
    const lineBottom = addNumToName("lineBottom", num);
    const lineExtTop = addNumToName("lineExtTop", num);
    const lineExtBottom = addNumToName("lineExtBottom", num);
    const lineExtTailTop = addNumToName("lineExtTailTop", num);
    const lineExtTailBottom = addNumToName("lineExtTailBottom", num);
    const lineCenter = addNumToName("lineCenter", num);
    const shelfPoint = addNumToName("shelfPoint", num);
    const shelfPointExt = addNumToName("shelfPointExt", num);
    const outerTailTop = addNumToName("outerTailTop", num);
    const outerTailBottom = addNumToName("outerTailBottom", num);
    const textNull = addNumToName("textNull", num);
    const topNull = addNumToName("topNull", num);
    const shelfNull = addNumToName("shelfNull", num);
    const bottomNull = addNumToName("bottomNull", num);
    const animationStart = 0.0;
    const animationEnd = 1.0;

    arrowWidth = 40;
    arrowHeight = 50;

    expressions = {
        radian: "const anchor1 = thisComp.layer(\"" + lineTop + "\").transform.position;\n" + 
                "const anchor2 = thisComp.layer(\"" + lineBottom + "\").transform.position;\n" + 
                "const coord = [(anchor1[0] - anchor2[0]).toFixed(2) * -1, (anchor1[1] - anchor2[1]).toFixed(2)];\n" + 
                "const rad = Math.atan2(coord[0], coord[1]);\n" + 
                "effect(\"radian\")(\"Slider\").value = rad;",

        angle: "const rad = effect(\"radian\")(\"Slider\");\n" + 
                "const angle = (rad * (180 / Math.PI)).toFixed(2);\n" + 
                "effect(\"angle\")(\"Angle\").value = angle;", 

        centerPoint: "var p1 = thisComp.layer(\"" + lineTop + "\").transform.position;\n" + 
                "var p2 = thisComp.layer(\"" + lineBottom + "\").transform.position;\n" + 
                "[(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]",

        textSource: "const ln = thisComp.layer(\"" + mainNull + "\").effect(\"numToLabel\")(\"Slider\")\n" +
                "const lbl = (thisComp.layer(\"quantity\").text.sourceText.value * (ln / 100)).toFixed(thisComp.layer(\"" + mainNull + "\").effect(\"pointSigns\")(\"Slider\").value);\n" +
                "text.sourceText.style.setText(`${lbl} ${thisComp.layer(\"points\").text.sourceText}`)" + 
                ".setFillColor(thisComp.layer(\"" + mainNull + "\").effect(\"fontColor\")(\"Color\"))" + 
                ".setFontSize(thisComp.layer(\"" + mainNull + "\").effect(\"fontSize\")(\"Slider\"));",

        textAnchor: "const s = thisLayer.sourceRectAtTime();\n" +
                "const w = s.width / 2;\n" +
                "const h = s.height / 2;\n" +
                "const l = s.left;\n" +
                "const t = s.top;\n" +
                "const a = thisComp.layer(\"" + mainNull + "\").effect(\"radian\")(\"Slider\").value;\n" +
                "const b = thisComp.layer(\"" + mainNull + "\").effect(\"lineBias\")(\"Slider\").value;\n" +
                "var menuValue = thisComp.layer(\"" + mainNull + "\").effect(\"Dropdown Menu Control\")(\"Menu\").value;\n" +
                "if (menuValue === 1) {\n" +
                "    transform.anchorPoint = [l + w, t + h];\n" +
                "} else if (menuValue === 2) {\n" +
                "    transform.anchorPoint = [l + w, t + h];\n" +
                "} else if (menuValue === 3) {\n" +
                "    transform.anchorPoint = [l + w + 2 * b * Math.cos(a), t + h + b * Math.sin(a)];\n" +
                "} else {\n" +
                "    transform.anchorPoint = [l + w, t + h + b];\n" +
                "}",

        textRotation: "var menuValue = thisComp.layer(\"" + mainNull + "\").effect(\"Dropdown Menu Control\")(\"Menu\").value;\n" +
                "var turnModifier = thisComp.layer(\"" + mainNull + "\").effect(\"turnLabel\")(\"Checkbox\").value === 1 ? 180 : 0;\n" +
                "if (menuValue === 4) {\n" +
                "    transform.rotation = thisComp.layer(\"" + mainNull + "\").effect(\"angle\")(\"Angle\") + 90 + turnModifier;\n" +
                "} else {\n" +
                "    transform.rotation = 0;\n" +
                "}",

        textPosition: "var menuValue = thisComp.layer(\"" + mainNull + "\").effect(\"Dropdown Menu Control\")(\"Menu\").value;\n" +
                "var textSize = thisLayer.sourceRectAtTime();\n" +
                "var lrModifier = thisComp.layer(\"" + mainNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\").value === 1 ? 1 : -1;\n" +
                "var centerBias = thisComp.layer(\"" + mainNull + "\").effect(\"fontSize\")(\"Slider\") / 4;\n" +
                "var lineBias = thisComp.layer(\"" + mainNull + "\").effect(\"lineBias\")(\"Slider\").value;\n" +
                "var shelf = thisComp.layer(\"" + shelfPoint + "\").transform.position;\n" +
                "if (menuValue === 1) {\n" +
                "    transform.position = [shelf[0] + (textSize.width / 2 + centerBias) * lrModifier, shelf[1] - lineBias];\n" +
                "} else if (menuValue === 2) {\n" +
                "    transform.position = comp(\"" + baseCompName + "\").layer(\"" + textNull + "\").transform.position\n" +
                "} else if (menuValue === 3) {\n" +
                "    var pos = thisComp.layer(\"" + lineCenter + "\").transform.position;\n" +
                "    transform.position = [pos[0], \n" +
                "                          pos[1]];\n" +
                "} else {\n" +
                "    transform.position = thisComp.layer(\"" + lineCenter + "\").transform.position;\n" +
                "}",

        strokeColor: "thisComp.layer(\"" + mainNull + "\").effect(\"lineColor\")(\"Color\")",

        strokeWidth: "thisComp.layer(\"" + mainNull + "\").effect(\"lineWidth\")(\"Slider\")",

        extStrokeWidth: "thisComp.layer(\"" + mainNull + "\").effect(\"extLineStrokeWidth\")(\"Slider\")",

        extLineTopNull: "var mainPoint = thisComp.layer(\"" + lineTop + "\").transform.position;\n" +
                "var angle = thisComp.layer(\"" + mainNull + "\").effect(\"radian\")(\"Slider\");\n" +
                "var extLineLen =  thisComp.layer(\"" + mainNull + "\").effect(\"extLine\")(\"Slider\");\n" +
                "var rads = thisComp.layer(\"" + mainNull + "\").effect(\"extLineAngleControl_1\")(\"Angle\") * Math.PI / 180;\n" +
                "[mainPoint[0] + extLineLen * Math.cos(angle + rads), mainPoint[1] + extLineLen * Math.sin(angle + rads)];",

        extLineBottomNull: "var mainPoint = thisComp.layer(\"" + lineBottom + "\").transform.position;\n" +
                "var angle = thisComp.layer(\"" + mainNull + "\").effect(\"radian\")(\"Slider\");\n" +
                "var extLineLen =  thisComp.layer(\"" + mainNull + "\").effect(\"extLine\")(\"Slider\");\n" +
                "var rads = thisComp.layer(\"" + mainNull + "\").effect(\"extLineAngleControl_2\")(\"Angle\") * Math.PI / 180;\n" +
                "[mainPoint[0] + extLineLen * Math.cos(angle + rads), mainPoint[1] + extLineLen * Math.sin(angle + rads)];",

        extLineTailTopNull: "var mainPoint = thisComp.layer(\"" + lineTop + "\").transform.position;\n" +
                "var angle = thisComp.layer(\"" + mainNull + "\").effect(\"radian\")(\"Slider\");\n" +
                "var extLineLen =  thisComp.layer(\"" + mainNull + "\").effect(\"extLineTail\")(\"Slider\");\n" +
                "var rads = thisComp.layer(\"" + mainNull + "\").effect(\"extLineAngleControl_1\")(\"Angle\") * Math.PI / 180;\n" +
                "[mainPoint[0] - extLineLen * Math.cos(angle + rads), mainPoint[1] - extLineLen * Math.sin(angle + rads)];",

        extLineTailBottomNull: "var mainPoint = thisComp.layer(\"" + lineBottom + "\").transform.position;\n" +
                "var angle = thisComp.layer(\"" + mainNull + "\").effect(\"radian\")(\"Slider\");\n" +
                "var extLineLen =  thisComp.layer(\"" + mainNull + "\").effect(\"extLineTail\")(\"Slider\");\n" +
                "var rads = thisComp.layer(\"" + mainNull + "\").effect(\"extLineAngleControl_2\")(\"Angle\") * Math.PI / 180;\n" +
                "[mainPoint[0] - extLineLen * Math.cos(angle + rads), mainPoint[1] - extLineLen * Math.sin(angle + rads)];",

        shelfPointNull: "shelfPoint = thisComp.layer(\"" + shelfPoint + "\").transform.position;\n" +
                "textSize = thisComp.layer(\"mainLabel\").sourceRectAtTime();\n" +
                "var modifier = parseInt(thisComp.layer(\"" + mainNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\")) === 1 ? 1 : -1;\n" +
                "[shelfPoint[0] + (textSize.width + thisComp.layer(\"" + mainNull + "\").effect(\"fontSize\")(\"Slider\") / 3) * modifier, shelfPoint[1]];",

        extLinesVisibility: "var modifier = parseInt(thisComp.layer(\"" + mainNull + "\").effect(\"extLinesSwitch\")(\"Checkbox\"));\n" +
                "100 * modifier;",

        shelfLinesVisibility: "var modifier = parseInt(thisComp.layer(\"" + mainNull + "\").effect(\"shelfSwitch\")(\"Checkbox\"));\n" + 
                "100 * modifier;",

        outerLinesVisibility: "var modifier = parseInt(thisComp.layer(\"" + mainNull + "\").effect(\"outerLinesSwitch\")(\"Checkbox\"));\n" + 
                "100 * modifier;",

        shelfLeftRigth: "var shelfPoint = thisComp.layer(\"" + shelfPoint + "\").transform.position;\n" +
                "var textSize = thisComp.layer(\"mainLabel\").sourceRectAtTime();\n" +
                "var modifier = parseInt(thisComp.layer(\"" + mainNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\")) === 1 ? 1 : -1\n" +
                "[shelfPoint[0] + (textSize.width + 40) * modifier , shelfPoint[1]]",

        outerLineTopNull: "var mainPoint = thisComp.layer(\"" + lineTop + "\").transform.position;\n" +
                "var angle = thisComp.layer(\"" + mainNull + "\").effect(\"radian\")(\"Slider\");\n" +
                "var extLineLen =  thisComp.layer(\"" + mainNull + "\").effect(\"outerLine\")(\"Slider\");\n" +
                "[mainPoint[0] - extLineLen * Math.sin(angle), mainPoint[1] + extLineLen * Math.cos(angle)];", 
        
        outerLineBottomNull: "var mainPoint = thisComp.layer(\"" + lineBottom + "\").transform.position;\n" +
                "var angle = thisComp.layer(\"" + mainNull + "\").effect(\"radian\")(\"Slider\");\n" +
                "var extLineLen =  thisComp.layer(\"" + mainNull + "\").effect(\"outerLine\")(\"Slider\");\n" +
                "[mainPoint[0] + extLineLen * Math.sin(angle), mainPoint[1] - extLineLen * Math.cos(angle)];", 

        arrowTop: "thisComp.layer(\"" + lineTop + "\").transform.position;",

        arrowBottom: "thisComp.layer(\"" + lineBottom + "\").transform.position;",

        arrowTopAngle: "var modifier = parseInt(thisComp.layer(\"" + mainNull + "\").effect(\"turnArrows\")(\"Checkbox\")) === 1 ? 0 : 180;\n" +
                "thisComp.layer(\"" + mainNull + "\").effect(\"angle\")(\"Angle\") - 180 + modifier;",

        arrowBottomAngle: "var modifier = parseInt(thisComp.layer(\"" + mainNull + "\").effect(\"turnArrows\")(\"Checkbox\")) === 1 ? 0 : 180;\n" +
                "thisComp.layer(\"" + mainNull + "\").effect(\"angle\")(\"Angle\") + modifier;",

        arrowSize: "temp = thisComp.layer(\"" + mainNull + "\").effect(\"arrowSize\")(\"Slider\");\n" +
                "[temp, temp]",

        rectSize: "const w = thisComp.layer(\"mainLabel\").sourceRectAtTime().width;\n" +
                "const h = thisComp.layer(\"mainLabel\").sourceRectAtTime().height;\n" +
                "const m = thisComp.layer(\"" + mainNull + "\").effect(\"margins\")(\"Slider\");\n" +
                "[w + m, h + m];",

        rectPosition: "const s = thisComp.layer(\"mainLabel\").sourceRectAtTime();\n" +
                "const w = s.width / 2;\n" +
                "const h = s.height / 2;\n" +
                "const l = s.left;\n" +
                "const t = s.top;\n" +
                "const b = thisComp.layer(\"" + mainNull + "\").effect(\"bias\")(\"Slider\");\n" +
                "[l + w, t + h - b];",

        rectRoudness: "thisComp.layer(\"" + mainNull + "\").effect(\"roundness\")(\"Slider\");",

        rectStroke: "thisComp.layer(\"" + mainNull + "\").effect(\"strokeWidth\")(\"Slider\");",
        
        rectStrokeColor: "thisComp.layer(\"" + mainNull + "\").effect(\"labelStrokeColor\")(\"Color\");",

        rectFillColor: "thisComp.layer(\"" + mainNull + "\").effect(\"labelFillColor\")(\"Color\");",

        rectFillOpacity: "thisComp.layer(\"" + mainNull + "\").effect(\"labelFillOpacity\")(\"Slider\");",

        rectOpacity: "thisComp.layer(\"" + mainNull + "\").effect(\"labelOpacity\")(\"Slider\");",
    };

    var nullNames = [mainNull, lineCenter, lineExtTop, lineExtBottom, lineExtTailTop, lineExtTailBottom, 
        shelfPointExt, outerTailTop, outerTailBottom, lineTop, lineBottom, shelfPoint];

    for (var i = 0; i < nullNames.length; i++) {
        addNewNull(comp, nullNames[i], "[100, 100]", "");
    }
    
    comp.layers.byName(lineCenter).transform.position.expression = expressions.centerPoint;
    comp.layers.byName(lineExtTop).transform.position.expression = expressions.extLineTopNull;
    comp.layers.byName(lineExtBottom).transform.position.expression = expressions.extLineBottomNull;
    comp.layers.byName(lineExtTailTop).transform.position.expression = expressions.extLineTailTopNull;
    comp.layers.byName(lineExtTailBottom).transform.position.expression = expressions.extLineTailBottomNull;
    comp.layers.byName(outerTailTop).transform.position.expression = expressions.outerLineTopNull;
    comp.layers.byName(outerTailBottom).transform.position.expression = expressions.outerLineBottomNull;
    comp.layers.byName(shelfPointExt).transform.position.expression = expressions.shelfPointNull;

    var mainNullLayer = comp.layers.byName(mainNull);
    
    addSlider(comp, mainNullLayer, "radian", 0, "", expressions.radian);
    addSlider(comp, mainNullLayer, "numToLabel", 100, "Слайдер для роста числа", "");
    addSlider(comp, mainNullLayer, "bias", 0, "Отклонение рамки от центра плашки", "");
    addSlider(comp, mainNullLayer, "margins", 50, "Границы плашки", "");
    addSlider(comp, mainNullLayer, "roundness", 10, "Углы плашки, закругление", "");
    addSlider(comp, mainNullLayer, "strokeWidth", 3, "Границы плашки, толщина", "");
    addSlider(comp, mainNullLayer, "labelOpacity", 100, "Прозрачность плашки", "");
    addSlider(comp, mainNullLayer, "labelFillOpacity", 100, "Прозрачность заливки плашки", "");
    addSlider(comp, mainNullLayer, "lineBias", 50, "Отклонение плашки от линии", "");
    addSlider(comp, mainNullLayer, "arrowSize", 100, "Размер стрелок", "");
    addSlider(comp, mainNullLayer, "lineWidth", 5, "Толщина линий", "");
    addSlider(comp, mainNullLayer, "extLineStrokeWidth", 3, "Толщина выносных линий", "");
    addSlider(comp, mainNullLayer, "extLine", 300, "Длина выносной линии", "");
    addSlider(comp, mainNullLayer, "extLineTail", 30, "Длина хвоста выносной линии", "");
    addSlider(comp, mainNullLayer, "outerLine", 100, "Длина хвоста внешней стрелки", "");
    addSlider(comp, mainNullLayer, "pointSigns", 1, "Количество знаков после запятой", "");
    addSlider(comp, mainNullLayer, "fontSize", 75, "Размер шрифта", "");

    addAngleControl(mainNullLayer, "angle", 0, expressions.angle);
    addAngleControl(mainNullLayer, "extLineAngleControl_1", 0, "");
    addAngleControl(mainNullLayer, "extLineAngleControl_2", 0, "");

    mainNullLayer.property("Effects")
            .property("extLineAngleControl_1")
            .property("ADBE Angle Control-0001")
            .addToMotionGraphicsTemplateAs(comp, "Угол выносной линии 1");
    mainNullLayer.property("Effects")
            .property("extLineAngleControl_2")
            .property("ADBE Angle Control-0001")
            .addToMotionGraphicsTemplateAs(comp, "Угол выносной линии 2");

    addCheckBox(comp, mainNullLayer, "leftRightSwitch", "Лево / право");
    addCheckBox(comp, mainNullLayer, "shelfSwitch", "Полка");
    addCheckBox(comp, mainNullLayer, "extLinesSwitch", "Выносные линии");
    addCheckBox(comp, mainNullLayer, "outerLinesSwitch", "Внешние линии");
    addCheckBox(comp, mainNullLayer, "turnArrows", "Развернуть стрелки");
    addCheckBox(comp, mainNullLayer, "turnLabel", "Развернуть плашку на 180");

    addDropDownMenu(mainNullLayer, "labelType", ["Текст на полке (Shelf)",
            "Свободная (Free)", 
            "Привязанная без поворота (Attached without rotation)", 
            "Привязанная с поворотом (Attached with rotation)"]);
    mainNullLayer.property("Effects")
            .property("Dropdown Menu Control")
            .property("Menu")
            .addToMotionGraphicsTemplateAs(comp, "Тип плашки");

    addColorControl(comp, mainNullLayer, "fontColor", [0.9, 0.9, 0.9], "Цвет шрифта");
    addColorControl(comp, mainNullLayer, "labelFillColor", [0.1, 0.1, 0.1], "Цвет заливки плашки");
    addColorControl(comp, mainNullLayer, "labelStrokeColor", [0.9, 0.9, 0.9], "Цвет обводки плашки");
    addColorControl(comp, mainNullLayer, "lineColor", [0.9, 0.9, 0.9], "Цвет линий");

    addRectangle(comp, "labelBox", [100, 60], [0.9, 0.9 ,0.9], 100, 5, [0.8, 0.8, 0.8], 100, [100, 100]);
    rectAddExpressions(comp, "labelBox", expressions.rectSize, expressions.rectPosition, expressions.rectRoudness, 
                            expressions.rectStroke, expressions.rectStrokeColor, expressions.rectFillColor, 
                            expressions.rectFillOpacity, expressions.rectOpacity);

    addTextField(comp, "points", "см", "Единицы измерения", "", "", "", "", "", false);
    addTextField(comp, "quantity", 135, "Количество", "", "", "", "", "", false);

    addTextField(comp, "mainLabel", "", "Главная плашка", 
            expressions.textRotation, "", expressions.textAnchor, expressions.textSource, expressions.textPosition, true);

    var line = createShape([[100, 100], [300, 300]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], false);
    
    var lines = ["lineSize", "lineShelf", "lineShelfExt", "outerLineTop", "outerLineBottom"];
    var extLines = ["lineExtTop", "lineExtBottom", "lineExtTailTop", "lineExtTailBottom"];
    var shelfLines = ["lineShelf", "lineShelfExt"];
    var outerLines = ["outerLineTop", "outerLineBottom"];


    for (i = 0; i < lines.length; i++) {
        addShapeToLayer(comp, lines[i], line, [0.9,0.9,0.9], 100, 5, [0, 0], 
                        expressions.strokeColor, expressions.strokeWidth, "", "", false, [0, 0]);
    }

    for (i = 0; i < extLines.length; i++) {
        addShapeToLayer(comp, extLines[i], line, [0.9,0.9,0.9], 100, 5, [0, 0], 
                        expressions.strokeColor, expressions.extStrokeWidth, "", "", false, [0, 0]);
    }
    
    setPathExp(comp, "lineSize", lineTop, lineBottom);
    setPathExp(comp, "lineExtTop", lineTop, lineExtTop);
    setPathExp(comp, "lineExtBottom", lineBottom, lineExtBottom);
    setPathExp(comp, "lineExtTailTop", lineTop, lineExtTailTop);
    setPathExp(comp, "lineExtTailBottom", lineBottom, lineExtTailBottom);
    setPathExp(comp, "lineShelf", lineCenter, shelfPoint);
    setPathExp(comp, "lineShelfExt", shelfPoint, shelfPointExt);
    setPathExp(comp, "outerLineTop", lineTop, outerTailTop);
    setPathExp(comp, "outerLineBottom", lineBottom, outerTailBottom);

    addVisibilityExpression(comp, extLines, expressions.extLinesVisibility);
    addVisibilityExpression(comp, shelfLines, expressions.shelfLinesVisibility);
    addVisibilityExpression(comp, outerLines, expressions.outerLinesVisibility);

    var arrow = createShape([[0, arrowHeight], [arrowWidth / 2, 0], [arrowWidth, arrowHeight], [arrowWidth / 2, arrowWidth]], 
                            [[0, 0], [0, 0], [0, 0], [0, 0]], 
                            [[0, 0], [0, 0], [0, 0], [0, 0]], true);

    addShapeToLayer(comp, "arrowTop", arrow, [0.9,0.9,0.9], 100, 3, [0, 0], expressions.strokeColor, expressions.strokeWidth, expressions.rectFillColor, "", false, [arrowWidth / 2, 0]);
    addShapeToLayer(comp, "arrowBottom", arrow, [0.9,0.9,0.9] , 100, 3, [0, 0], expressions.strokeColor, expressions.strokeWidth, expressions.rectFillColor, "", false, [arrowWidth / 2, 0]);

    var arrowTop = comp.layers.byName("arrowTop");
    var arrowBottom = comp.layers.byName("arrowBottom");
    
    arrowTop.property("Position").expression = expressions.arrowTop;
    arrowTop.property("Scale").expression = expressions.arrowSize;
    arrowTop.property("Rotation").expression = expressions.arrowTopAngle;
    arrowTop.moveToBeginning();
    arrowBottom.property("Position").expression = expressions.arrowBottom;
    arrowBottom.property("Scale").expression = expressions.arrowSize;
    arrowBottom.property("Rotation").expression = expressions.arrowBottomAngle;
    arrowBottom.moveToBeginning();

    var figureToLock = lines.concat(["arrowTop", "arrowBottom"]).concat(extLines);
    
    for (var i = 0; i < figureToLock.length; i++) {
        comp.layers.byName(figureToLock[i]).locked = true;
    }

    comp.layers.byName(lineTop).property("Position").expression = "comp(\"" + baseCompName + "\").layer(\"" + topNull +"\").transform.position";
    comp.layers.byName(lineBottom).property("Position").expression = "comp(\"" + baseCompName + "\").layer(\"" + bottomNull +"\").transform.position";
    comp.layers.byName(shelfPoint).property("Position").expression = "comp(\"" + baseCompName + "\").layer(\"" + shelfNull +"\").transform.position";

    var lines = ["lineSize", "lineShelf", "lineShelfExt", "outerLineTop", "outerLineBottom", 
                 "lineExtTop", "lineExtBottom", "lineExtTailTop", "lineExtTailBottom"];
    
    addTrimKeys(comp, "lineSize", "Start", [animationStart, animationEnd * 0.45], [50, 0], true);
    addTrimKeys(comp, "lineSize", "End", [animationStart, animationEnd * 0.45], [50, 100], false);
    addTrimKeys(comp, "lineShelf", "End", [animationStart, animationEnd * 0.3], [0, 100], true);
    addTrimKeys(comp, "lineShelfExt", "End", [animationEnd * 0.3, animationEnd * 0.5], [0, 100], true);
    addTrimKeys(comp, "outerLineTop", "End", [animationEnd * 0.4, animationEnd * 0.6], [0, 100], true);
    addTrimKeys(comp, "outerLineBottom", "End", [animationEnd * 0.4, animationEnd * 0.6], [0, 100], true);
    addTrimKeys(comp, "lineExtTop", "End", [animationEnd * 0.4, animationEnd * 0.6], [0, 100], true);
    addTrimKeys(comp, "lineExtBottom", "End", [animationEnd * 0.4, animationEnd * 0.6], [0, 100], true);
    addTrimKeys(comp, "lineExtTailTop", "End", [animationEnd * 0.4, animationEnd * 0.6], [0, 100], true);
    addTrimKeys(comp, "lineExtTailBottom", "End", [animationEnd * 0.4, animationEnd * 0.6], [0, 100], true);

    addDeepKeys(comp, "arrowTop", "Scale", [animationEnd * 0.4, animationEnd * 0.5, animationEnd * 0.52], [[0, 0], [120, 120], [100, 100]]);
    addDeepKeys(comp, "arrowBottom", "Scale", [animationEnd * 0.4, animationEnd * 0.5, animationEnd * 0.52], [[0, 0], [120, 120], [100, 100]]);

    addDeepKeys(comp, "labelBox", "Scale", [animationEnd * 0.4, animationEnd * 0.52], [[0, 0], [100, 100]]);

    addKeys(comp, "mainLabel", "Scale", [animationEnd * 0.4, animationEnd * 0.52], [[0, 0], [100, 100]]);
}

function main() {
    log("Starting at " + new Date().toTimeString() + "================================================");
    app.beginUndoGroup("sizeArrow");
    var baseComp = app.project.activeItem;

    if (baseComp instanceof CompItem) {
        var num = generateRandomNumber().toString().split(".")[1].slice(0, 6);
        var name = "sizeArrow_" + num;
        var newSizeArrow = app.project.items.addComp(name, 3840, 2160, 1, 60, 50);
    
        baseComp.layers.add(newSizeArrow);
        var bName = baseComp.name;
        log("Comp " + name + " created");
        createSizeArrow(bName, newSizeArrow, num);
        baseComp.layers.byName(name).moveToBeginning();
        baseComp.layers.byName(name).locked = true;

        var nullNames = ["topNull", "shelfNull", "bottomNull", "textNull"];
        var nullPos = [[1500, 900], [1300, 1200], [500, 900], [400, 400]];

        for (i = 0; i < nullNames.length; i++) {
            var nullName = addNumToName(nullNames[i], num);
            var newNull = addNewNull(baseComp, nullName, "[100, 100]", "");  
            newNull.transform.position.setValue(nullPos[i])
        }

    } else {
        alert("Надо сначала выбрать нужную композицию, потом запускать скрипт!");
    }
    app.endUndoGroup();
}

main();
