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

function main() {
    app.beginUndoGroup("Starting");

    
    var expressions = {
        threeDPosition: "var h = thisComp.height / 2;\n" +
            "var w = thisComp.width / 2;\n" +
            "var pos = thisComp.layer(\"pointer\").transform.position;\n" +
            "[w - ((pos[0] - w) / 10), h - (pos[1] - h) / 10, 0];\n",
        xRotation: "var h = thisComp.height / 2;\n" + 
            "var pos = thisComp.layer(\"pointer\").transform.position;\n" + 
            "-(pos[1] - h ) / (h / 10);\n",
        yRotation: "var w = thisComp.width / 2;\n" + 
            "var pos = thisComp.layer(\"pointer\").transform.position;\n" + 
            "(pos[0] - w ) / (w / 10);\n",
        nullScale: "[100, 100]"
    }

    var currSeq = app.project.activeItem;

    activeLayer = currSeq.selectedLayers[0];

    if (activeLayer !== undefined) {
    
        var nullLayer = currSeq.layers.addNull();
        nullLayer.name = "pointer";
        nullLayer.property("Scale").expression = expressions.nullScale;
       
        activeLayer.threeDLayer = true;
        activeLayer.property("Position").expression = expressions.threeDPosition;
        activeLayer.property("xRotation").expression = expressions.xRotation;
        activeLayer.property("yRotation").expression = expressions.yRotation;
    
    } else {
        alert("Надо выбрать слой, к которому будет применен скрипт");
    }
    app.endUndoGroup();
}

main();



