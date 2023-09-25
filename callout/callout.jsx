﻿function addNewNull(comp, name, exp) {
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

function setExp(comp, layername, begin, end) {

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
                "transform.anchorPoint = [x, 25];"

    };

    var aText = comp.layers.addText("Callout_" + num);
    aText.name = "textField";
    aText.position.expression = "const x = thisComp.layer(\"" + centerPoint + "\").transform.position[0];\n" + 
            "const y = thisComp.layer(\"" + centerPoint + "\").transform.position[1];\n" +
            "[x, y];"

    aText.transform.anchorPoint.expression = expressions.textPosition;
    
    var nullProps = comp.layers.addNull();
    nullProps.name = baseNull;
    nullProps.position.setValue([0, 0]);
    var slider = nullProps.property("Effects").addProperty("ADBE Slider Control");
    slider.name = "lineThickness";
    slider.property("Slider").setValue(5);
    // slider.property("Slider").minValue = 1;
    // slider.property("Slider").maxValue = 30;
    slider.property("Slider").expression = "clamp(value, 1, 25)";

    var chBox = nullProps.property("Effects").addProperty("ADBE Checkbox Control");
    chBox.name = "leftRightSwitch";
    chBox.property("Checkbox").setValue(true);

    var textColor = nullProps.property("Effects").addProperty("ADBE Color Control");
    textColor.name = "textColor";
    textColor.property("Color").setValue([0.9,0.5,0.5]);

    var lineColor = nullProps.property("Effects").addProperty("ADBE Color Control");
    lineColor.name = "lineColor";
    lineColor.property("Color").setValue([0.4,0.8,0.8]);

    
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
    
    var line = createShape([[100, 100], [200, 300]], 
        [[0, 0], [0, 0]], [[0, 0], [0, 0]], false);

    var lines = ["mainLine", "horizLine", "secondLine"];
    for (i = 0; i < lines.length; i++) {
        addShapeToLayer(comp, lines[i], line, [0.9,0.9,0.9], 100, 10, [0, 0], expressions.strokeColor, "", false);
        var lineLayer = comp.layers.byName(lines[i]);
        var textLayer = comp.layers.byName("textField");
        lineLayer.moveAfter(textLayer);
    }
    
    setExp(comp, lines[0], arrowPoint, centerPoint);
    setExp(comp, lines[1], centerPoint, endPoint);
    setExp(comp, lines[2], secondLineStart, secondLineEnd);


    addCircleToLayer(comp, "innerCircle", [50, 50], 
                    [0.8,0.8,0.8], 100, 10, [0.8,0.8,0.8], 100, [0, 0], expressions.strokeColor, "");
    
    addCircleToLayer(comp, "outerCircle", [80, 80], 
                    [0.8,0.8,0.8], 100, 10, [0.8,0.8,0.8], 0, [0, 0], expressions.strokeColor, "");
    

    var baseLayer = comp.layers.byName("arrowPoint_" + num);
    var attachedLayers = [comp.layers.byName("innerCircle"), comp.layers.byName("outerCircle"), comp.layers.byName("angle")];

    for (i = 0; i < attachedLayers.length; i++) {
        attachedLayers[i].setParentWithJump(baseLayer);
        attachedLayers[i].moveAfter(baseLayer);
    }
}

function processProperty(theProp) {
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

function log(input) {
    $.writeln(input);
    var logFile = File("e:/logfile.txt");
    logFile.open("a");
    logFile.writeln(input);
    logFile.close();
}

function main () {
    log("Starting at " + new Date().toTimeString() + "================================================");
    
    var baseComp = app.project.item(1);
    var dig = generateRandomNumber().toString().split(".")[1].slice(0, 6);
    var name = "callout_" + dig;
    var newCallout = app.project.items.addComp(name, 3840, 2160, 1, 60, 50);

    baseComp.layers.add(newCallout);
    //newCallout.openInViewer();
    log("Composition " + name + " created");
    createCallout(newCallout, dig);
    // var mainArrow = addNewNull(baseComp, "arrow_" + num, "");
    // var mainCenter = addNewNull(baseComp, "center_" + num, "");

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