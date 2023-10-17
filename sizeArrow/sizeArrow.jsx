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

function addNewNull(comp, name, exp) {
    var nullLayer = comp.layers.addNull();
    nullLayer.name = name;
    if (exp !== "") {
        nullLayer.property("Scale").expression = exp;
    }
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



function createSizeArrow(comp, num) {

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
        baseComp.layers.byName(name).locked = true;

        var nulls = ["topNull", "bottomNull", "topArrowNull", "bottomArrowNull"];

        for (i = 0; i < nulls.length; i++) {
            addNewNull(baseComp, nulls[i], "100, 100");
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