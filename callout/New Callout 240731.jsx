function processProperty(theProp) {
    if (theProp.propertyType == PropertyType.PROPERTY) {
        try {
            log(theProp.name + " " + theProp.value);
        } catch (e) {
            log(theProp.name + " " + "NO VALUE");
        }
        if (theProp.name === "Skew Axis") {
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
 * 1. считать размер секвенции и создавать коллаут в центре
 * 2. Снова поломали координаты текста
 * 3. вывести текст наверх, к якорям
 */

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
    var trim = comp.layers.byName(layername)
                .property("ADBE Root Vectors Group")
                .property("ADBE Vector Group")
                .property("ADBE Vectors Group")
                .property("ADBE Vector Filter - Trim");
    var trimStart = trim.property("ADBE Vector Trim Start");
    trimStart.expression = exp;
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
    layerOpacity.expression = "100 * thisComp.layer(\"" + baseNull + "\").effect(\"" + name + "Switch\")(\"Checkbox\");"
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
    const animationStart = 0.0;
    const lineAppearance = 0.3;
    const animationEnd = 0.6;


    const expressions = {
        secondLineEndExp: "var x = thisComp.layer(\"" + endPoint + "\").transform.position[0];\n" +
                "var y = thisComp.layer(\"" + endPoint + "\").transform.position[1] + 15;\n" +
                "[x, y];",

        angleRotation: "const x = thisComp.layer(\"" + arrowPoint + "\").transform.position[0] - thisComp.layer(\"" + centerPoint + "\").transform.position[0];\n" +
                "const y = (thisComp.layer(\"" + arrowPoint + "\").transform.position[1] - thisComp.layer(\"" + centerPoint + "\").transform.position[1]) * -1;\n" +
                "const angle = (Math.atan2(x, y) + Math.PI) * 180 / Math.PI;\n" +
                "angle;",

        strokeColor: "thisComp.layer(\"" + baseNull + "\").effect(\"lineColor\")(\"Color\");",
        
        arrowColor: "thisComp.layer(\"" + baseNull + "\").effect(\"arrowColor\")(\"Color\");",

        strokeWidth: "thisComp.layer(\"" + baseNull + "\").effect(\"lineThickness\")(\"Slider\");",

        angleThickness: "thisComp.layer(\"" + baseNull + "\").effect(\"angleThickness\")(\"Slider\");",

        //textPosition: "const m = thisComp.layer(\"" + baseNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\").value;\n" +
        //        "const s = thisLayer.sourceRectAtTime().width;\n" +
        //        "const x = m == 1 ? -20 - s / 2 : 20 + s / 2;" + 
        //        //"const x = m == 1 ? -20 : 20 + s;\n" +
        //        "transform.anchorPoint = [x, 25];",

        innerCircleSizeExp: "temp = thisComp.layer(\"" + baseNull + "\").effect(\"innerCircleSize\")(\"Slider\");\n" + 
            "[temp, temp]",

        outerCircleSizeExp: "temp = thisComp.layer(\"" + baseNull + "\").effect(\"outerCircleSize\")(\"Slider\");\n" + 
            "[temp, temp]",

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

    /* 
    var aText = comp.layers.addText("Callout_" + num);
    aText.name = "textField";
    aText.position.expression = "const x = thisComp.layer(\"" + centerPoint + "\").transform.position[0];\n" + 
            "const y = thisComp.layer(\"" + centerPoint + "\").transform.position[1];\n" +
            "[x, y];"
    aText.transform.anchorPoint.expression = expressions.textPosition;
    // aText.property("ADBE Text Properties").property("ADBE Text Document")
    //         .addToMotionGraphicsTemplateAs(comp, "Текст коллаута");
    // aText.property("ADBE Text Properties").property("ADBE Text Document")
    //         .expression = "text.sourceText.style.setFillColor(thisComp.layer(\"" + baseNull + "\").effect(\"textColor\")(\"Color\"))"

    var textOpacity = aText.property("Opacity");
    var textScale = aText.property("Scale");

    textOpacity.addKey(animationEnd * 0.5);
    textOpacity.addKey(animationEnd);
    textOpacity.setValueAtKey(1, 0);
    textOpacity.setValueAtKey(2, 100);

    textScale.addKey(animationEnd * 0.5);
    textScale.addKey(animationEnd);
    textScale.setValueAtKey(1, [80, 80]);
    textScale.setValueAtKey(2, [100, 100]); 
    */

    var nullProps = comp.layers.addNull();
    nullProps.name = baseNull;
    nullProps.position.setValue([0, 0]);

    // adding controls

    addSlider(nullProps, "lineThickness", 5);
    addSlider(nullProps, "angleThickness", 8);
    addSlider(nullProps, "innerCircleSize", 50);
    addSlider(nullProps, "outerCircleSize", 70);
    addSlider(nullProps, "arrowSize", 20);
    addSlider(nullProps, "textHorBias", 50);
    addSlider(nullProps, "textVerBias", 50);


    addCheckBox(comp, nullProps, "leftRightSwitch", "Право/лево");
    addCheckBox(comp, nullProps, "angleSwitch", "Включить указатель");
    addCheckBox(comp, nullProps, "innerCircleSwitch", "Включить внутренний круг");
    addCheckBox(comp, nullProps, "outerCircleSwitch", "Включить внешний круг");
    addCheckBox(comp, nullProps, "secondLineSwitch", "Включить вторую линию");

    // addColorControl(comp, nullProps, "textColor", [0.9, 0.9, 0.95], "Цвет текста");
    addColorControl(comp, nullProps, "lineColor", [0.6, 0.6, 0.65], "Цвет линий");
    addColorControl(comp, nullProps, "arrowColor", [0.2, 0.2, 0.22], "Цвет указателя");

    // nulls for main line
    
    addNewNull(comp, arrowPoint, "");
    addNewNull(comp, centerPoint, "");        
    addNewNull(comp, "endPoint_" + num, "");
    addNewNull(comp, "secondLineStart_" + num, "");
    addNewNull(comp, "secondLineEnd_" + num, expressions.secondLineEndExp);

    //shapes

    var angleShape = createShape([[0, 0], [40, 60], [80, 0]],
        [[0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0]], false);
    
    addShapeToLayer(comp, "angle", angleShape, [0.2,0.2,0.2], 100, 15, [0, 0], "", expressions.angleRotation, true);

    var arrowLayer = comp.layers.byName("angle");

    arrowLayer.property("Scale").expression = expressions.angleSize;

    var arrow = arrowLayer.property("Contents")
            .property("ADBE Vector Group");
    
    var arrowColor = arrow
            .property("Contents")
            .property("ADBE Vector Graphic - Stroke").property("Color");

    var arrowOpacity = arrow
            .property("ADBE Vector Transform Group")
            .property("ADBE Vector Group Opacity");

    arrowOpacity.addKey(animationStart + 0.1);
    arrowOpacity.addKey(lineAppearance + 0.1);
    arrowOpacity.setValueAtKey(1, 0);
    arrowOpacity.setValueAtKey(2, 100);

    arrowColor.expression = expressions.arrowColor;


    var line = createShape([[100, 100], [200, 300]], 
        [[0, 0], [0, 0]], [[0, 0], [0, 0]], false);

    var lines = ["mainLine", "horizLine", "secondLine"];

    for (i = 0; i < lines.length; i++) {
        addShapeToLayer(comp, lines[i], line, [0.9,0.9,0.9], 100, 10, [0, 0], expressions.strokeColor, "", false);
        var lineLayer = comp.layers.byName(lines[i]);
        //var textLayer = comp.layers.byName("textField");
        //lineLayer.moveAfter(textLayer);

        var trim = lineLayer.property("ADBE Root Vectors Group")
                .property("ADBE Vector Group")
                .property("ADBE Vectors Group")
                .addProperty("ADBE Vector Filter - Trim");
        var trimEnd = trim.property("ADBE Vector Trim End");
        
        if (lineLayer.name == "mainLine") {
            var opacity = lineLayer.property("Opacity");
            opacity.addKey(lineAppearance - 0.01);
            opacity.addKey(lineAppearance);
            opacity.setValueAtKey(1, 0);
            opacity.setValueAtKey(2, 100);
            trimEnd.addKey(animationStart + lineAppearance - 0.1);
            trimEnd.addKey(animationEnd / 2 + lineAppearance);
            trimEnd.setValueAtKey(1, 0);
            trimEnd.setValueAtKey(2, 100);
        } else if (lineLayer.name == "horizLine") {
            trimEnd.addKey(animationEnd * 0.5 + lineAppearance);
            trimEnd.addKey(animationEnd + lineAppearance);
            trimEnd.setValueAtKey(1, 0);
            trimEnd.setValueAtKey(2, 100);
        } else { //secondLine
            trimEnd.addKey(animationEnd * 0.65 + lineAppearance);
            trimEnd.addKey(animationEnd + lineAppearance);
            trimEnd.setValueAtKey(1, 0);
            trimEnd.setValueAtKey(2, 100);
        }
    }
    
    setPathExp(comp, lines[0], arrowPoint, centerPoint);
    setPathExp(comp, lines[1], centerPoint, endPoint);
    setPathExp(comp, lines[2], secondLineStart, secondLineEnd);

    setLineLength(comp, "mainLine", expressions.lineLength);

    addCircleToLayer(comp, "innerCircle", [50, 50], 
                    [0.8,0.8,0.8], 100, 10, [0.8,0.8,0.8], 100, [0, 0], 
                    expressions.strokeColor, expressions.innerCircleSizeExp);
    
    addCircleToLayer(comp, "outerCircle", [80, 80], 
                    [0.8,0.8,0.8], 100, 10, [0.8,0.8,0.8], 0, [0, 0], 
                    expressions.strokeColor, expressions.outerCircleSizeExp);
    

    var baseLayer = comp.layers.byName("arrowPoint_" + num);
    var attachedLayers = [comp.layers.byName("innerCircle"), 
                comp.layers.byName("outerCircle"), comp.layers.byName("angle")];

    for (i = 0; i < attachedLayers.length; i++) {
        attachedLayers[i].setParentWithJump(baseLayer);
        attachedLayers[i].moveAfter(baseLayer);
    }

    attachCheckBox(comp, "outerCircle", baseNull);
    attachCheckBox(comp, "angle", baseNull);
    attachCheckBox(comp, "secondLine", baseNull);
    attachCheckBox(comp, "innerCircle", baseNull);

    addToMGT(comp, "lineThickness", "Толщина линий", baseNull);
    addToMGT(comp, "innerCircleSize", "Размер внутреннего круга", baseNull);
    addToMGT(comp, "outerCircleSize", "Размер внешнего круга", baseNull);
    addToMGT(comp, "arrowSize", "Размер указателя", baseNull);
    addToMGT(comp, "angleThickness", "Толщина указателя", baseNull);
    addToMGT(comp, "textHorBias", "Смещение текста по горизонтали", baseNull);
    addToMGT(comp, "textVerBias", "Смещение текста по вертикалия", baseNull);

    var lineThicknessLayers = [
        comp.layers.byName("outerCircle"), 
        comp.layers.byName("mainLine"),
        comp.layers.byName("horizLine"), 
        comp.layers.byName("secondLine"),
    ];

    for (var i = 0; i < lineThicknessLayers.length; i++) {
        var vectorLayer = lineThicknessLayers[i].property("ADBE Root Vectors Group")
        .property("ADBE Vector Group")
        .property("ADBE Vectors Group")
        .property("ADBE Vector Graphic - Stroke");
        vectorLayer.property("ADBE Vector Stroke Width").expression = expressions.strokeWidth;
    }

    var vectorLayer = comp.layers.byName("angle").property("ADBE Root Vectors Group")
        .property("ADBE Vector Group")
        .property("ADBE Vectors Group")
        .property("ADBE Vector Graphic - Stroke");
    vectorLayer.property("ADBE Vector Stroke Width").expression = expressions.angleThickness;

    var animationLayers = [
        comp.layers.byName("outerCircle"),
        comp.layers.byName("innerCircle"),
    ];

    for (var i = 0; i < animationLayers.length; i++) {
        var aLayer = animationLayers[i].property("Scale");
        aLayer.addKey(animationStart);
        aLayer.addKey(lineAppearance);
        aLayer.addKey(lineAppearance + 0.1);
        aLayer.setValueAtKey(1, [0, 0]);
        aLayer.setValueAtKey(2, [120, 120]);
        aLayer.setValueAtKey(3, [100, 100]);
    }

}
 
function log(input) {
    $.writeln(input);
}

function main () {
    log("Starting at " + new Date().toTimeString() + "================================================");
    
    var baseComp = app.project.activeItem;

    app.beginUndoGroup("New callout");
    if (baseComp instanceof CompItem) {
        var dig = generateRandomNumber().toString().split(".")[1].slice(0, 6);
        var baseWidth = baseComp.width;
        var baseHeight = baseComp.height;
        var name = "callout_" + dig;
        var newCallout = app.project.items.addComp(name, baseWidth, baseHeight, 1, 60, 50);

        baseComp.layers.add(newCallout);
        log("Composition " + name + " created");
        createCallout(newCallout, dig);
        baseComp.layers.byName(name).moveToBeginning();
        baseComp.layers.byName(name).locked = true;

        var mainArrow = baseComp.layers.addNull();
        mainArrow.name = "mainArrow" + dig;
        mainArrow.property("Scale").expression = "[100, 100]";
        //processProperty(mainArrow)
        mainArrow.property("Position").setValue([100, 300]);
        var mainCenter = baseComp.layers.addNull();
        mainCenter.name = "mainCenter" + dig;
        mainCenter.property("Position").setValue([300, 200]);
        mainCenter.property("Scale").expression = "[100, 100]";

        var slaveCenter = newCallout.layers.byName("centerPoint_" + dig);
        var slaveArrow = newCallout.layers.byName("arrowPoint_" + dig);

        slaveCenter.moveToBeginning();
        slaveArrow.moveToBeginning();
        
        slaveArrow.property("Position").expression = "var x = comp(\"" + baseComp.name + "\").layer(\"" + mainArrow.name + "\").transform.position[0];\n" + 
        "var y = comp(\"" + baseComp.name + "\").layer(\"" + mainArrow.name + "\").transform.position[1];\n" + 
        "[x, y]";

        slaveCenter.property("Position").expression = "var x = comp(\"" + baseComp.name + "\").layer(\"" + mainCenter.name + "\").transform.position[0];\n" + 
        "var y = comp(\"" + baseComp.name + "\").layer(\"" + mainCenter.name + "\").transform.position[1];\n" + 
        "[x, y]";

        /*
        textField = comp("2024_07_00_Минипроектор_на_потолке_ Linked Comp 02").layer("textField_768947");
const m = thisComp.layer("mainNull_768947").effect("leftRightSwitch")("Checkbox").value;
const modifier = m == 1 ? 1 : -1;
const x = thisComp.layer("centerPoint_768947").transform.position[0] + (textField.sourceRectAtTime().width * 0.33) * modifier;
const y = thisComp.layer("centerPoint_768947").transform.position[1] + 15;
[x, y];
        
        */
        
        const baseNull = "mainNull_" + dig;
        const centerPoint = "centerPoint_" + dig;

        
        const exprs = {
            endPointExp: "textField = comp(\"" + baseComp.name + "\").layer(\"" + "textField_" + dig + "\") \n" + 
                "const m = thisComp.layer(\"" + baseNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\").value;\n" +
                "const modifier = m == 1 ? 1 : -1;\n" +
                "const x = (textField.sourceRectAtTime().width + 40) * modifier + thisComp.layer(\"" + centerPoint + "\").transform.position[0];\n" +
                "const y = thisComp.layer(\"" + centerPoint + "\").transform.position[1];\n" +
                "[x, y];",

            secondLineStartExp: "textField = comp(\"" + baseComp.name + "\").layer(\"" + "textField_" + dig + "\") \n" + 
                "const m = thisComp.layer(\"" + baseNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\").value;\n" +
                "const modifier = m == 1 ? 1 : -1;\n" +
                "const x = thisComp.layer(\"" + centerPoint + "\").transform.position[0] + (textField.sourceRectAtTime().width * 0.33) * modifier;\n" +
                "const y = thisComp.layer(\"" + centerPoint + "\").transform.position[1] + 15;\n" +
                "[x, y];",

            textPosition: "centerNull = thisComp.layer(\"" + mainCenter.name + "\");\n" +
                "const x = centerNull.transform.position[0];\n" +
                "const y = centerNull.transform.position[1];\n" +
                "[x, y];",

            textAnchorPosition: "calloutComp = comp(\"callout_" + dig + "\");\n" +
                "horBias = calloutComp.layer(\"" + baseNull + "\").effect(\"textHorBias\")(\"Slider\").value;\n" +
                "vertBias = calloutComp.layer(\"" + baseNull + "\").effect(\"textVerBias\")(\"Slider\").value;\n" +
                "leftRightSwitch = calloutComp.layer(\"" + baseNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\").value;\n" +
                "const s = thisLayer.sourceRectAtTime().width;\n" +
                "const h = thisLayer.sourceRectAtTime().height;\n" +
                "const x = leftRightSwitch == 1 ? -20 - s / 2 : 20 + s / 2;\n" + 
                "[x + (horBias - 50) * 10, h + (vertBias - 50) * 10];"
        }
        
        var aText = baseComp.layers.addText("Callout_" + dig);
        aText.name = "textField_" + dig;
        aText.position.expression = exprs.textPosition;
        aText.transform.anchorPoint.expression = exprs.textAnchorPosition;

        const animationEnd = 0.6;
    
        var textOpacity = aText.property("Opacity");
        
        textOpacity.addKey(animationEnd * 0.5);
        textOpacity.addKey(animationEnd);
        textOpacity.setValueAtKey(1, 0);
        textOpacity.setValueAtKey(2, 100);
        
        var textScale = aText.property("Scale");

        textScale.addKey(animationEnd * 0.5);
        textScale.addKey(animationEnd);
        textScale.setValueAtKey(1, [80, 80]);
        textScale.setValueAtKey(2, [100, 100]);

        var endPoint = newCallout.layers.byName("endPoint_" + dig);
        endPoint.position.expression = exprs.endPointExp;

        var secondLineStart = newCallout.layers.byName("secondLineStart_" + dig);
        secondLineStart.position.expression = exprs.secondLineStartExp;
        
        
    } else {
        alert("Надо сначала выбрать нужную композицию, потом запускать скрипт!");
    }
    app.endUndoGroup();
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