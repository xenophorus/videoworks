﻿function processProperty(theProp) {
    if (theProp.propertyType == PropertyType.PROPERTY) {
        try {
            log(theProp.name + " " + theProp.value);
        } catch (e) {
            log(theProp.name + " " + "NO VALUE");
        }
    } else {
        for (var i = 1; i <= theProp.numProperties; i++) {
            processProperty(theProp.property(i));
        }
    }
}

function addNewNull(comp, name, exp) {
    var nullLayer = comp.layers.addNull();
    nullLayer.name = name;
    if (exp !== "") {
        nullLayer.position.expression = exp;
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

function addShapeToLayer(comp, name, shape, color, opacity, stroke, position, exp1, rotationExp, center) {

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

    if (exp1 !== "") {
        lineStroke.property("Color").expression = exp1;
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

}

function addCircleToLayer(comp, name, size, strokeColor, strokeOpacity, 
                          strokeWidth, fillColor, fillOpacity, position, exp1, exp2) {
    var circleLayer = comp.layers.addShape();
    circleLayer.name = name;
    var shapeGroup = circleLayer.property("Contents").addProperty("ADBE Vector Group");
    var circle = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    circle.property("Size").setValue(size);
    circle.property("Size").expression = exp2;

    var circleStroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    circleStroke.property("Color").setValue(strokeColor);
    circleStroke.property("Opacity").setValue(strokeOpacity);
    circleStroke.property("Stroke Width").setValue(strokeWidth);
    
    if (exp1 !== "") {
        circleStroke.property("Color").expression = exp1;
    }
    
    var circleFill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    circleFill.property("Color").setValue(fillColor);
    circleFill.property("Opacity").setValue(fillOpacity);
    
    if (exp1 !== "") {
        circleFill.property("Color").expression = exp1;
    }
    
    circleLayer.transform.position.setValue(position);

}

function setPathExp(comp, layername, begin, end) {

    const exp = "offset = [thisComp.width, thisComp.height]/2\n" + 
    "p1 = thisComp.layer(\"" + begin + "\").toComp([0,0]).slice(0,2)\n" + 
    "p2 = thisComp.layer(\"" + end + "\").toComp([0,0]).slice(0,2)\n" + 
    "ps = [p1, p2]\n" + 
    "in_tangents = []\n" + 
    "out_tangents = []\n" + 
    "createPath(ps, in_tangents, out_tangents, is_closed=false)"

    var path = comp.layers.byName(layername)
                .property("ADBE Root Vectors Group")
                .property("ADBE Vector Group")
                .property("ADBE Vectors Group")
                .property("ADBE Vector Shape - Group")
                .property("ADBE Vector Shape");
    
    path.expression = exp;
}

function setLineLength(comp, layername, exp) {

    var line = comp.layers.byName(layername)
                .property("ADBE Root Vectors Group")
                .property("ADBE Vector Group")
                .property("ADBE Vectors Group");
                // .property("ADBE Vector Shape - Group");
                // .property("ADBE Vector Shape");
    var trim = line.addProperty("ADBE Vector Filter - Trim");
    var trimStart = trim.property("ADBE Vector Trim Start");
    trimStart.expression = exp;
    
    
    log(1);
    // path.expression = exp;
}

function centerAnchorPoint(layer) {
    // https://community.adobe.com/t5/after-effects-discussions/centering-the-anchor-point/m-p/9350657
    var comp = layer.containingComp;
    var curTime = comp.time;
    var layerAnchor = layer.anchorPoint.value;
    var x = layer.sourceRectAtTime(curTime, false).width/2;
    var y = layer.sourceRectAtTime(curTime, false).height/2;
    x += layer.sourceRectAtTime(curTime, false).left;
    y += layer.sourceRectAtTime(curTime, false).top;
    var xAdd = (x-layerAnchor[0]) * (layer.scale.value[0]/100);
    var yAdd = (y-layerAnchor[1]) * (layer.scale.value[1]/100);
    layer.anchorPoint.setValue([ x, y ]);
    var layerPosition = layer.position.value;
    layer.position.setValue([ layerPosition[0] + xAdd, layerPosition[1] + yAdd, layerPosition[2] ]);
};

function addCheckBox(comp, layer, name, showName) {
    var chBox = layer.property("Effects").addProperty("ADBE Checkbox Control");
    chBox.name = name;
    chBox.property("Checkbox").setValue(true);
    chBox.property("Checkbox").addToMotionGraphicsTemplateAs(comp, showName);
}

function addSlider(layer, name, value) {
    var slider = layer.property("Effects").addProperty("ADBE Slider Control");
    slider.name = name;
    slider.property("Slider").setValue(value);
}

function addColorControl(comp, layer, name, color, showName) {
    var colorControl = layer.property("Effects").addProperty("ADBE Color Control");
    colorControl.name = name;
    colorControl.property("Color").setValue(color);
    colorControl.property("Color").addToMotionGraphicsTemplateAs(comp, showName);
}

function attachCheckBox(comp, name, baseNull) {
    var layerOpacity = comp.layers.byName(name).property("Opacity");
    layerOpacity.expression = "transform.opacity = 100 * thisComp.layer(\"" + baseNull + "\").effect(\"" + name + "Switch\")(\"Checkbox\");"
}

function addToMGT(comp, name, rusName, baseNull) {
    comp.layers.byName(baseNull).property("Effects").property(name)
        .property("ADBE Slider Control-0001")
        .addToMotionGraphicsTemplateAs(comp, rusName);
}

function createCallout(comp, num) {
    const centerPoint = "centerPoint_" + num; // "baseDot"
    const arrowPoint = "arrowPoint_" + num; // angleDot
    const baseNull = "mainNull_" + num; // nullObject1
    const endPoint = "endPoint_" + num; // baseLineEnd
    const secondLineStart = "secondLineStart_" + num; //
    const secondLineEnd = "secondLineEnd_" + num; //

    const expressions = {
        endPointExp: "const m = thisComp.layer(\"" + baseNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\").value;\n" +
                "const modifier = m == 1 ? 1 : -1;\n" +
                "const x = (thisComp.layer(\"textField\").sourceRectAtTime().width + 40) * modifier + thisComp.layer(\"" + centerPoint + "\").transform.position[0];\n" +
                "const y = thisComp.layer(\"" + centerPoint + "\").transform.position[1];\n" +
                "[x, y];",

        secondLineStartExp: "const m = thisComp.layer(\"" + baseNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\").value;\n" +
                "const modifier = m == 1 ? 1 : -1;\n" +
                "const x = thisComp.layer(\"" + centerPoint + "\").transform.position[0] + (thisComp.layer(\"textField\").sourceRectAtTime().width * 0.33) * modifier;\n" +
                "const y = thisComp.layer(\"" + centerPoint + "\").transform.position[1] + 15;\n" +
                "[x, y];",

        secondLineEndExp: "var x = thisComp.layer(\"" + endPoint + "\").transform.position[0];\n" +
                "var y = thisComp.layer(\"" + endPoint + "\").transform.position[1] + 15;\n" +
                "[x, y];",

        angleRotation: "const x = thisComp.layer(\"" + arrowPoint + "\").transform.position[0] - thisComp.layer(\"" + centerPoint + "\").transform.position[0];\n" +
                "const y = (thisComp.layer(\"" + arrowPoint + "\").transform.position[1] - thisComp.layer(\"" + centerPoint + "\").transform.position[1]) * -1;\n" +
                "const angle = (Math.atan2(x, y) + Math.PI) * 180 / Math.PI;\n" +
                "transform.rotation = angle;",

        strokeColor: "thisComp.layer(\"" + baseNull + "\").effect(\"lineColor\")(\"Color\");",

        strokeWidth: "thisComp.layer(\"" + baseNull + "\").effect(\"lineThickness\")(\"Slider\");",

        textPosition: "const m = thisComp.layer(\"" + baseNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\").value;\n" +
                "const s = thisLayer.sourceRectAtTime().width;\n" +
                "const x = m == 1 ? -20 : 20 + s;\n" +
                "transform.anchorPoint = [x, 25];",

        innerCircleSizeExp: "temp = thisComp.layer(\"" + baseNull + "\").effect(\"innerCircleSize\")(\"Slider\");\n" + "[temp, temp]",

        outerCircleSizeExp: "temp = thisComp.layer(\"" + baseNull + "\").effect(\"outerCircleSize\")(\"Slider\");\n" + "[temp, temp]",

        angleSize: "temp = thisComp.layer(\"" + baseNull + "\").effect(\"arrowSize\")(\"Slider\");\n" + 
                "[temp, temp];",
        
        lineLength: "var startP = thisComp.layer(\"" + arrowPoint + "\").transform.position;\n" +
                "var endP = thisComp.layer(\"" + centerPoint + "\").transform.position;\n" +
                "var len = Math.sqrt(Math.pow((startP[0] - endP[0]), 2) + Math.pow((startP[1] - endP[1]), 2));\n" +
                "var rad = thisComp.layer(\"outerCircle\").content(\"Group 1\").content(\"Ellipse Path 1\").size[1] / 2;\n" +
                
                "if (thisComp.layer(\"outerCircle\").transform.opacity > 0) {\n" +
                "    content(\"Group 1\").content(\"Trim Paths 1\").start = rad / (len / 100);\n" +
                "} else {\n" +
                "    content(\"Group 1\").content(\"Trim Paths 1\").start = 0;\n" +
                "}",

    };

    var aText = comp.layers.addText("Callout_" + num);
    aText.name = "textField";
    aText.position.expression = "const x = thisComp.layer(\"" + centerPoint + "\").transform.position[0];\n" + 
            "const y = thisComp.layer(\"" + centerPoint + "\").transform.position[1];\n" +
            "[x, y];"
    aText.transform.anchorPoint.expression = expressions.textPosition;
    aText.property("ADBE Text Properties").property("ADBE Text Document").addToMotionGraphicsTemplateAs(comp, "Текст коллаута");
    aText.property("ADBE Text Properties").property("ADBE Text Document").expression = "text.sourceText.style.setFillColor(thisComp.layer(\"" + baseNull + "\").effect(\"textColor\")(\"Color\"))"
    
    var nullProps = comp.layers.addNull();
    nullProps.name = baseNull;
    nullProps.position.setValue([0, 0]);

    // adding controls

    addSlider(nullProps, "lineThickness", 5);
    addSlider(nullProps, "innerCircleSize", 50);
    addSlider(nullProps, "outerCircleSize", 70);
    addSlider(nullProps, "arrowSize", 20);

    addCheckBox(comp, nullProps, "leftRightSwitch", "Право/лево");
    addCheckBox(comp, nullProps, "angleSwitch", "Включить уголок");
    addCheckBox(comp, nullProps, "innerCircleSwitch", "Включить внутренний круг");
    addCheckBox(comp, nullProps, "outerCircleSwitch", "Включить внешний круг");
    addCheckBox(comp, nullProps, "secondLineSwitch", "Включить вторую линию");

    addColorControl(comp, nullProps, "textColor", [0.9, 0.8, 0.6], "Цвет текста");
    addColorControl(comp, nullProps, "lineColor", [0.9, 0.6, 0.8], "Цвет линий");

    // nulls for main line
    
    addNewNull(comp, arrowPoint, "");
    addNewNull(comp, centerPoint, "");        
    addNewNull(comp, "endPoint_" + num, expressions.endPointExp);
    addNewNull(comp, "secondLineStart_" + num, expressions.secondLineStartExp);
    addNewNull(comp, "secondLineEnd_" + num, expressions.secondLineEndExp)

    //shapes

    var angleShape = createShape([[0, 0], [20, 20], [40, 0]],
        [[0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0]], false);
    
    addShapeToLayer(comp, "angle", angleShape, [0.2,0.2,0.2], 100, 10, [0, 0], "", expressions.angleRotation, true);

    comp.layers.byName("angle").property("Scale").expression = expressions.angleSize;
    
    var line = createShape([[100, 100], [200, 300]], 
        [[0, 0], [0, 0]], [[0, 0], [0, 0]], false);

    var lines = ["mainLine", "horizLine", "secondLine"];

    for (i = 0; i < lines.length; i++) {
        addShapeToLayer(comp, lines[i], line, [0.9,0.9,0.9], 100, 10, [0, 0], expressions.strokeColor, "", false);
        var lineLayer = comp.layers.byName(lines[i]);
        var textLayer = comp.layers.byName("textField");
        lineLayer.moveAfter(textLayer);
    }
    
    setPathExp(comp, lines[0], arrowPoint, centerPoint);
    setPathExp(comp, lines[1], centerPoint, endPoint);
    setPathExp(comp, lines[2], secondLineStart, secondLineEnd);

    setLineLength(comp, "mainLine", expressions.lineLength);

    addCircleToLayer(comp, "innerCircle", [50, 50], 
                    [0.8,0.8,0.8], 100, 10, [0.8,0.8,0.8], 100, [0, 0], expressions.strokeColor, expressions.innerCircleSizeExp);
    
    addCircleToLayer(comp, "outerCircle", [80, 80], 
                    [0.8,0.8,0.8], 100, 10, [0.8,0.8,0.8], 0, [0, 0], expressions.strokeColor, expressions.outerCircleSizeExp);
    

    var baseLayer = comp.layers.byName("arrowPoint_" + num);
    var attachedLayers = [comp.layers.byName("innerCircle"), comp.layers.byName("outerCircle"), comp.layers.byName("angle")];

    for (i = 0; i < attachedLayers.length; i++) {
        attachedLayers[i].setParentWithJump(baseLayer);
        attachedLayers[i].moveAfter(baseLayer);
    }

    attachCheckBox(comp, "outerCircle", baseNull);
    attachCheckBox(comp, "angle", baseNull);
    attachCheckBox(comp, "secondLine", baseNull);
    attachCheckBox(comp, "innerCircle", baseNull);

    addToMGT(comp, "lineThickness", "Толщина линий", baseNull);
    addToMGT(comp, "innerCircleSize", "Размер точки", baseNull);
    addToMGT(comp, "outerCircleSize", "Размер внешнего круга", baseNull);
    addToMGT(comp, "arrowSize", "Размер стрелки", baseNull);

    var lineThicknessLayers = [
        comp.layers.byName("outerCircle"), comp.layers.byName("mainLine"),
        comp.layers.byName("horizLine"), comp.layers.byName("secondLine"),
    ];

    for (var i = 0; i < lineThicknessLayers.length; i++) {
        var vectorLayer = lineThicknessLayers[i].property("ADBE Root Vectors Group")
        .property("ADBE Vector Group")
        .property("ADBE Vectors Group")
        .property("ADBE Vector Graphic - Stroke");
        vectorLayer.property("ADBE Vector Stroke Width").expression = expressions.strokeWidth;

// анимация2

    }

}

function log(input) {
    $.writeln(input);
    var logFile = File("e:/logfile.txt");
    logFile.open("a");
    logFile.writeln(input);
    logFile.close();
}

function main () {
    log("Starting at " + new Date().toTimeString() + "================================================");
    
    var baseComp = app.project.activeItem;

    if (baseComp instanceof CompItem) {
        var dig = generateRandomNumber().toString().split(".")[1].slice(0, 6);
        var name = "callout_" + dig;
        var newCallout = app.project.items.addComp(name, 3840, 2160, 1, 60, 50);

        baseComp.layers.add(newCallout);
        //newCallout.openInViewer();
        log("Composition " + name + " created");
        createCallout(newCallout, dig);
        baseComp.layers.byName(name).moveToEnd();

        var mainArrow = baseComp.layers.addNull();
        mainArrow.name = "mainArrow" + dig;
        mainArrow.property("Scale").expression = "[100, 100]";
        var mainCenter = baseComp.layers.addNull();
        mainCenter.name = "mainCenter" + dig;
        mainCenter.property("Scale").expression = "[100, 100]";

        var slaveCenter = newCallout.layers.byName("centerPoint_" + dig);
        var slaveArrow = newCallout.layers.byName("arrowPoint_" + dig);
        
        slaveArrow.property("Position").expression = "var x = comp(\"" + baseComp.name + "\").layer(\"" + mainArrow.name + "\").transform.position[0];\n" + 
        "var y = comp(\"" + baseComp.name + "\").layer(\"" + mainArrow.name + "\").transform.position[1];\n" + 
        "[x, y]";

        slaveCenter.property("Position").expression = "var x = comp(\"" + baseComp.name + "\").layer(\"" + mainCenter.name + "\").transform.position[0];\n" + 
        "var y = comp(\"" + baseComp.name + "\").layer(\"" + mainCenter.name + "\").transform.position[1];\n" + 
        "[x, y]";
    } else {
        alert("Надо сначала выбрать нужную композицию, потом запускать скрипт!");
    }



    
    var items = app.project.items;

    //search for calloutSeq in callout project
    var myComp;
    for (i = 1; i<=app.project.numItems; i++) {
        if (app.project.item(i).name === "calloutSeq") {
            myComp = app.project.item(i);
        }
    }
}

main();

/*
ADBE Vector Layer
ADBE Root Vectors Group
ADBE Vector Group
ADBE Vectors Group
ADBE Vector Shape - Group
ADBE Vector Shape

mainLine
Contents
Group 1
Contents
Path 1
Path
*/