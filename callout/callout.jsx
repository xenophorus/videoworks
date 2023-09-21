function addNewNull(comp, name, exp) {
    var nullLayer = comp.layers.addNull();
    nullLayer.name = name;
    if (exp !== "") {
        nullLayer.position.expression = exp;
    }
}

function createCallout(comp, num) {
    // const calloutSeq = "callout_" + num;
    const centerPoint = "centerPoint_" + num;
    const arrowPoint = "arrowPoint_" + num;
    const baseNull = "mainNull_" + num;

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
    textColor.property("Color").setValue([0.9,0.9,0.9]);

    var lineColor = nullProps.property("Effects").addProperty("ADBE Color Control");
    lineColor.name = "lineColor";
    lineColor.property("Color").setValue([0.8,0.8,0.8]);

    
    // nulls for main line
    const endPointExp = "const m = thisComp.layer(\"" + baseNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\").value;\n" +
        "const modifier = m == 1 ? 1 : -1;\n" +
        "const x = (thisComp.layer(\"textField\").sourceRectAtTime().width + 40) * modifier + thisComp.layer(\"" + centerPoint + "\").transform.position[0];\n" +
        "const y = thisComp.layer(\"" + centerPoint + "\").transform.position[1];\n" +
        "[x, y];"

    const secondLineStartExp = "const m = thisComp.layer(\"" + baseNull + "\").effect(\"leftRightSwitch\")(\"Checkbox\").value;\n" +
        "const modifier = m == 1 ? 1 : -1;\n" +
        "const x = thisComp.layer(\"" + centerPoint + "\").transform.position[0] + (thisComp.layer(\"textField\").sourceRectAtTime().width * 0.33) * modifier;\n" +
        "const y = thisComp.layer(\"" + centerPoint + "\").transform.position[1] + 15;\n" +
        "[x, y];"

    const secondLineEndExp = "var x = thisComp.layer(\"baseLineEnd\").transform.position[0];\n" +
        "var y = thisComp.layer(\"baseLineEnd\").transform.position[1] + 15;\n" +
        "[x, y];"


    addNewNull(comp, arrowPoint, "");
    addNewNull(comp, centerPoint, "");        
    addNewNull(comp, "endPoint_" + num, endPointExp);
    addNewNull(comp, "secondLineStart_" + num, secondLineStartExp);
    addNewNull(comp, "secondLineEnd_" + num, secondLineEndExp)

    //shapes
    var shapeLayer = comp.layers.addShape();
    shapeLayer.name = "angle";
    var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");

    var arrowShape = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Group");
    var arrowShape = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");

    // arrowShape.property("Path").vertices = [[1370, 127], [1400, 100], [1370, 73]];

    var myShape = new Shape();
    myShape.vertices = [[0,0], [0,100], [100,100], [100,0]];
    myShape.closed = false;
    comp.layers.add(myShape);

    // arrowShape.closed = false;
    
    log("Adding arrow shape");

    
    //control nulls - add them later to main comp

}

function processProperty(theProp) {
    if (theProp.propertyType == PropertyType.PROPERTY) {
        log(theProp.name);
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

    lr = layers.byName("angle");
    log(lr.name)
    processProperty(lr);

}

main();


//comp("baseSeq").layer("arrowPoint").transform.xPosition
