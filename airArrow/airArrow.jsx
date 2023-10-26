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

function log(input) {
    $.writeln(input);
    var logFile = File("e:/logfile.txt");
    logFile.open("a");
    logFile.writeln(input);
    logFile.close();
}

function tracePath(){
    /*
    function from "Create Nulls From Paths.jsx"
    */
    var undoGroup = localize("$$$/AE/Script/CreatePathNulls/CreatePathTracerNull=Create Path Tracer Null");
    app.beginUndoGroup(undoGroup);

    var sliderName = localize("$$$/AE/Script/CreatePathNulls/TracerTiming=Tracer Timing");
    var checkboxName = localize("$$$/AE/Script/CreatePathNulls/LoopTracer=Loop Tracer");

    forEachPath(function(comp,selectedLayer,path){
        var pathHierarchy = [];
        var pathPath = getPropPath(path, pathHierarchy);

        // Create tracer null
        var newNull = createNull(comp);
        newNull.moveBefore(selectedLayer);

        // Add expression control effects to the null
        var nullControl = newNull.property("ADBE Effect Parade").addProperty("Pseudo/ADBE Trace Path");
        nullControl.property("Pseudo/ADBE Trace Path-0002").setValue(true);
        nullControl.property("Pseudo/ADBE Trace Path-0001").setValuesAtTimes([0,1],[0,100]);
        nullControl.property("Pseudo/ADBE Trace Path-0001").expression =
                    "if(thisProperty.propertyGroup(1)(\"Pseudo/ADBE Trace Path-0002\") == true && thisProperty.numKeys > 1){ \r" +
                    "thisProperty.loopOut(\"cycle\"); \r" +
                    "} else { \r" +
                    "value \r" +
                    "}";
        newNull.position.expression =
                "var pathLayer = thisComp.layer(\"" + selectedLayer.name + "\"); \r" +
                "var progress = thisLayer.effect(\"Pseudo/ADBE Trace Path\")(\"Pseudo/ADBE Trace Path-0001\")/100; \r" +
                "var pathToTrace = pathLayer" + pathPath + "; \r" +
                "pathLayer.toComp(pathToTrace.pointOnPath(progress));";
        newNull.rotation.expression =
                "var pathToTrace = thisComp.layer(\"" + selectedLayer.name + "\")" + pathPath + "; \r" +
                "var progress = thisLayer.effect(\"Pseudo/ADBE Trace Path\")(\"Pseudo/ADBE Trace Path-0001\")/100; \r" +
                "var pathTan = pathToTrace.tangentOnPath(progress); \r" +
                "radiansToDegrees(Math.atan2(pathTan[1],pathTan[0]));";
        newNull.name = "Trace " + selectedLayer.name + ": " + path.parentProperty.name + " [" + pathHierarchy.join(".") + "]";
        newNull.label = 10;

    });
    app.endUndoGroup();
}

function main() {

}

main();