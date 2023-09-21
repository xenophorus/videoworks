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

function addShapeToLayer(comp, name, shape, color, opacity, stroke, exp1, exp2) {
    var layer = comp.layers.addShape();
    layer.name = name;
    var shapeGroup = layer.property("Contents").addProperty("ADBE Vector Group");
    var arrowShape = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Group");
    arrowShape.property("Path").setValue(shape);
    
    var arrowStroke =  shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    arrowStroke.property("Color").setValue(color);
    arrowStroke.property("Opacity").setValue(opacity);
    arrowStroke.property("Stroke Width").setValue(stroke);

    if (exp1 !== "") {
        arrowStroke.property("Color").expression = exp1;
    }

    centerAnchorPoint(layer);
}

function addCircleToLayer(comp, name, size, strokeColor, strokeOpacity, 
                          strokeWidth, fillColor, fillOpacity, exp1, exp2) {
    var circleLayer = comp.layers.addShape();
    circleLayer.name = name;
    var shapeGroup = circleLayer.property("Contents").addProperty("ADBE Vector Group");
    var circle = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    circle.property("Size").setValue(size);

    var circleStroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    circleStroke.property("Color").setValue(strokeColor);
    circleStroke.property("Opacity").setValue(strokeOpacity);
    circleStroke.property("Stroke Width").setValue(strokeWidth); 
    circleStroke.property("Color").expression = exp1;

    var circleFill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    circleFill.property("Color").setValue(fillColor);
    circleFill.property("Opacity").setValue(fillOpacity);
    circleFill.property("Color").expression = exp1;
    
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
    // const calloutSeq = "callout_" + num;
    const centerPoint = "centerPoint_" + num; // "baseDot"
    const arrowPoint = "arrowPoint_" + num; // angleDot
    const baseNull = "mainNull_" + num; // nullObject1

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

        secondLineEndExp: "var x = thisComp.layer(\"baseLineEnd\").transform.position[0];\n" +
            "var y = thisComp.layer(\"baseLineEnd\").transform.position[1] + 15;\n" +
            "[x, y];",

        angleRotation: "const x = thisComp.layer(\"" + arrowPoint + "\").transform.position[0] - thisComp.layer(\"" + centerPoint + "\").transform.position[0];\n" +
            "const y = (thisComp.layer(\"" + arrowPoint + "\").transform.position[1] - thisComp.layer(\"" + centerPoint + "\").transform.position[1]) * -1;\n" +
            "const angle = (Math.atan2(x, y) + Math.PI) * 180 / Math.PI;\n" +
            "transform.rotation = angle - 90;",

        strokeColor: "thisComp.layer(\"" + baseNull + "\").effect(\"lineColor\")(\"Color\");",

        strokeWidth: "thisComp.layer(\"" + baseNull + "\").effect(\"lineThickness\")(\"Slider\");",


    };

    var aText = comp.layers.addText(num);
    aText.name = "textField";
    aText.position.expression = "const x = thisComp.layer(\"" + centerPoint + "\").transform.position[0];\n" + 
            "const y = thisComp.layer(\"" + centerPoint + "\").transform.position[1];\n" +
            "[x, y];"
    
    var nullProps = comp.layers.addNull();
    nullProps.name = baseNull;
    nullProps.position.setValue([3900, 0]);
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

    var angleShape = createShape([[1370, 127], [1400, 100], [1370, 73]],
        [[0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0]], false);
    
    addShapeToLayer(comp, "angle", angleShape, [0.2,0.2,0.2], 100, 10, "", "");
    
    var mainLine = createShape([[100, 100], [150, 200], [200, 300]], 
        [[0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0]], false);

    addShapeToLayer(comp, "mainLine", mainLine, [0.9,0.9,0.9], 100, 10, expressions.strokeColor, "");
    
    var secondLine = createShape([[150, 100], [200, 250]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], false);

    addShapeToLayer(comp, "secondLine", secondLine, [0.9,0.9,0.9], 100, 10, expressions.strokeColor, "");


    addCircleToLayer(comp, "innerCircle", [50, 50], 
                    [0.8,0.8,0.8], 100, 10, [0.8,0.8,0.8], 100, expressions.strokeColor, "");
    
    addCircleToLayer(comp, "outerCircle", [80, 80], 
                    [0.8,0.8,0.8], 100, 10, [0.8,0.8,0.8], 0, expressions.strokeColor, "");
    
    var baseLayer = comp.layers.byName("arrowPoint");
    comp.layers.byName("innerCircle").parent(baseLayer);
    comp.layers.byName("outerCircle").parent(baseLayer);
    comp.layers.byName("angle").parent(baseLayer);
                    // arrowShape.property("Path").setValue(myShape);
    
    log("Adding arrow shape");

}

function processProperty(theProp) {
    if (theProp.propertyType == PropertyType.PROPERTY) {
        log(theProp.name);
        // if(theProp.name = "Fill Rule") {
        //     log(theProp.name);
        // }
    } else { // must be a group
        for (var i = 1; i <= theProp.numProperties; i++) {
            processProperty(theProp.property(i));
        }
    }
}

function log(input) {
    // var now = new Date();
    // var output = now.toTimeString() + ": " + input;
    $.writeln(input);
    var logFile = File("e:/logfile.txt");
    logFile.open("a");
    logFile.writeln(input);
    logFile.close();
}



function main () {
    log("Starting at " + new Date().toTimeString() + "================================================");
    var dig = generateRandomNumber().toString().split(".")[1].slice(0, 6);
    var name = "callout_" + dig;
    var p = app.project;
    var newCallout = app.project.items.addComp(name, 3840, 2160, 1, 60, 50);
    app.project.item(1).layers.add(newCallout);
    newCallout.openInViewer();
    log("Composition " + name + " created");
    createCallout(newCallout, dig);

    var items = app.project.items;

    //search for calloutSeq in callout project
    var myComp;
    for (i = 1; i<=app.project.numItems; i++) {
        if (app.project.item(i).name === "calloutSeq") {
            myComp = app.project.item(i);
        }
        
        // writeLn(app.project.item(i).name);
        // log(app.project.item(i).name);
    }

    // log(myComp.name);

    var layers = myComp.layers;
    
    // log(myComp.name + " " + layers.length);

    lr = layers.byName("outerCircle");
    log(lr.name)
    // processProperty(lr);

}

main();


//comp("baseSeq").layer("arrowPoint").transform.xPosition
