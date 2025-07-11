// function processProperty(theProp) {
//     if (theProp.propertyType == PropertyType.PROPERTY) {
//         try {
//             log(theProp.name + " " + theProp.value);
//         } catch (e) {
//             log(theProp.name + " " + "NO VALUE");
//         }
//         if (theProp.name === "Path") {
//             log(1);
//         }
//     } else {
//         for (var i = 1; i <= theProp.numProperties; i++) {
//             processProperty(theProp.property(i));
//         }
//     }
// }

// function log(input) {
//     $.writeln(input);

// }


function createNull(targetComp){
    /*
    function from Adobe's script "Create Nulls From Paths.jsx"
    */
    return targetComp.layers.addNull();
}

function getPropPath(currentProp,pathHierarchy){
    /*
    function from Adobe's script "Create Nulls From Paths.jsx"
    */
    var pathPath = "";
        while (currentProp.parentProperty !== null){

            if ((currentProp.parentProperty.propertyType === PropertyType.INDEXED_GROUP)) {
                pathHierarchy.unshift(currentProp.propertyIndex);
                pathPath = "(" + currentProp.propertyIndex + ")" + pathPath;
            } else {
                pathPath = "(\"" + currentProp.matchName.toString() + "\")" + pathPath;
            }

            // Traverse up the property tree
            currentProp = currentProp.parentProperty;
        }
    return pathPath
}

function tracePath(comp, selectedLayer, path){
    /*
    function from Adobe's script "Create Nulls From Paths.jsx"
    */

    var pathHierarchy = [];
    var pathPath = getPropPath(path, pathHierarchy);

        // Create tracer null
    var newNull = createNull(comp);
    newNull.moveBefore(selectedLayer);
    
    newNull.name = "trace_" + selectedLayer.name; // + ": " + path.parentProperty.name + " [" + pathHierarchy.join(".") + "]";

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
                "var pathLayer = thisComp.layer(`${thisLayer.name.substring(6)}`); \r" +
                "var progress = thisLayer.effect(\"Pseudo/ADBE Trace Path\")(\"Pseudo/ADBE Trace Path-0001\")/100; \r" +
                "var pathToTrace = pathLayer" + pathPath + "; \r" +
                "pathLayer.toComp(pathToTrace.pointOnPath(progress));";
    newNull.rotation.expression =
                "var pathToTrace = thisComp.layer(`${thisLayer.name.substring(6)}`)" + pathPath + "; \r" +
                "var progress = thisLayer.effect(\"Pseudo/ADBE Trace Path\")(\"Pseudo/ADBE Trace Path-0001\")/100; \r" +
                "var pathTan = pathToTrace.tangentOnPath(progress); \r" +
                "radiansToDegrees(Math.atan2(pathTan[1],pathTan[0]));";
    
    newNull.label = 10;
    
    //newNull.shy = true;

    return newNull.name;
};


function addSlider(comp, layer, name, value, showName) {
    var slider = layer.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider.name = name;
    slider.property("Slider").setValue(value);
    if (showName !== "") {
        slider.property("Slider").addToMotionGraphicsTemplateAs(comp, showName);
    }
}

function addCheckBox(comp, layer, name, showName) {
    var chBox = layer.property("Effects").addProperty("ADBE Checkbox Control");
    chBox.name = name;
    chBox.property("Checkbox").setValue(true);
    chBox.property("Checkbox").addToMotionGraphicsTemplateAs(comp, showName);
}

function addColorControl(comp, layer, name, color, showName) {
    var colorControl = layer.property("Effects").addProperty("ADBE Color Control");
    colorControl.name = name;
    colorControl.property("Color").setValue(color);
    colorControl.property("Color").addToMotionGraphicsTemplateAs(comp, showName);
}

function addNumToName(name, num) {
    return name + "_" + num;
}

function createShape(vertices, inTangents, outTangents, closed) {
    var shape = new Shape();
    shape.vertices = vertices;
    shape.inTangents = inTangents;
    shape.outTangents = outTangents;
    shape.closed = closed;
    return shape;
}

function addNewLine(layer, name, line) {
    
    var shapeGroup = layer.property("Contents").addProperty("ADBE Vector Group");
    shapeGroup.name = name;
    var lineShape = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Group");
    var linePath = lineShape.property("Path");
    linePath.setValue(line);
    return linePath;

}

function addPropsToLine(layer, name, taperStartLength, taperStartWidth, expressions) {
    var shapeGroup = layer.property("Contents").property(name);
    var lineStroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    lineStroke.property("Color").expression = expressions.arrowColor;
    lineStroke.property("Opacity").expression = expressions.arrowOpacity;
    if (name === "head") {
        lineStroke.property("Stroke Width").expression = expressions.headWidth;

        var lineTaper = lineStroke.property("ADBE Vector Stroke Taper");
        lineTaper.property("Start Length").setValue(taperStartLength); 
        lineTaper.property("Start Width").setValue(taperStartWidth);

        var lineTrim = shapeGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Filter - Trim");
        lineTrim.property("Start").expression = expressions.arrowHeadTrimStart; 
        lineTrim.property("End").expression = expressions.arrowHeadTrimEnd; 
    } else {
        lineStroke.property("Stroke Width").expression = expressions.tailWidth;

        var lineTaper = lineStroke.property("ADBE Vector Stroke Taper");
        lineTaper.property("Start Length").setValue(taperStartLength); 
        lineTaper.property("Start Width").setValue(taperStartWidth);

        var lineTrim = shapeGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Filter - Trim");
        lineTrim.property("Start").expression = expressions.arrowTailTrimStart; 
        lineTrim.property("End").expression = expressions.arrowTailTrimEnd; 

        shapeGroup.property("ADBE Vectors Group")
            .property("ADBE Vector Shape - Group")
            .property("ADBE Vector Shape").expression = "content(\"head\").content(\"Path 1\").path;";
    }
    
}

function main() {

    // log("Starting at " + new Date().toTimeString() + "================================================");
    app.beginUndoGroup("Air Arrow");
    var comp = app.project.activeItem;
    
    //comp.hideShyLayers = true;

    if (comp instanceof CompItem) {
        var num = generateRandomNumber().toString().split(".")[1].slice(0, 3);
        var name = "arrow_" + num;

        
        var line = createShape([[0, -500], [0, 500]], [[0, 20], [0, 0]], [[0, 10], [0, 10]], false);
        var line2 = createShape([[0, -500], [0, 500]], [[20, 0], [0, 0]], [[10, 0], [10, 0]], false);

        var layer = comp.layers.addShape();
        layer.name = name;

        var linePath = addNewLine(layer, "head", line);
        var pathName = tracePath(comp, layer, linePath);
        
        var mainNull = comp.layers.byName("trace_" + name);
        //addNewNull(comp, "mainNull_" + num, "[100, 100]", "-100, 100");

        addSlider(comp, mainNull, "arrowProportions", 78, "Пропорции стрелки"); // Проценты
        addSlider(comp, mainNull, "arrowLength", 20, "Длина стрелки");
        addSlider(comp, mainNull, "headWidth", 50, "Ширина головы"); 
        addSlider(comp, mainNull, "tailWidth", 50, "Ширина хвоста");
        addSlider(comp, mainNull, "arrowOpacity", 50, "Прозрачность стрелки");
        addColorControl(comp, mainNull, "arrowColor", [0.7, 0.7, 0.9], "Цвет стрелки");


        
        addNewLine(layer, "tail", line2);

        expressions = {
            
            arrowColor: "thisComp.layer(`trace_${thisLayer.name}`).effect(\"arrowColor\")(\"Color\");",
    
            headLen: "thisComp.layer(`trace_${thisLayer.name}`).effect(\"headLen\")(\"Slider\");",
    
            tailLen: "thisComp.layer(`trace_${thisLayer.name}`).effect(\"tailLen\")(\"Slider\");",
            
            headWidth: "thisComp.layer(`trace_${thisLayer.name}`).effect(\"headWidth\")(\"Slider\");",
    
            tailWidth: "thisComp.layer(`trace_${thisLayer.name}`).effect(\"tailWidth\")(\"Slider\");",
    
            arrowOpacity: "thisComp.layer(`trace_${thisLayer.name}`).effect(\"arrowOpacity\")(\"Slider\");",

            arrowHeadTrimStart: "var arrowLen = thisComp.layer(`trace_${thisLayer.name}`).effect(\"arrowLength\")(\"Slider\");\n" + 
                    "var progress = thisComp.layer(`trace_${thisLayer.name}`).effect(\"Trace Path\")(\"Progress\");\n" + 
                    "content(\"head\").content(\"Trim Paths 1\").start = arrowLen + progress;",

            arrowHeadTrimEnd: "var proportions = thisComp.layer(`trace_${thisLayer.name}`).effect(\"arrowProportions\")(\"Slider\");\n" + 
                    "var arrowLen = thisComp.layer(`trace_${thisLayer.name}`).effect(\"arrowLength\")(\"Slider\");\n" + 
                    "var progress = thisComp.layer(`trace_${thisLayer.name}`).effect(\"Trace Path\")(\"Progress\");\n" + 
                    "content(\"head\").content(\"Trim Paths 1\").end = arrowLen * proportions / 100 + progress;",

            arrowTailTrimStart: "content(\"head\").content(\"Trim Paths 1\").end;",

            arrowTailTrimEnd: "thisComp.layer(`trace_${thisLayer.name}`).effect(\"Trace Path\")(\"Progress\");",

            lineOpacity: "if (effect(\"arrowBlink\")(\"Checkbox\") == 1) {\n" + 
                "    thisProperty.loopOut(\"cycle\");\n" + 
                "} else {\n" + 
                "    100;\n" + 
                "}",
        }
        
        addPropsToLine(layer, "head", 100, 0, expressions);
        addPropsToLine(layer, "tail", 100, 20, expressions);

        opacity = layer.property("Opacity");

        addCheckBox(comp, layer, "arrowBlink", "Стрелка мигать")


        opacity.addKey(0);
        opacity.addKey(0.5);
        opacity.addKey(1);

        opacity.setValueAtKey(1, 100);
        opacity.setValueAtKey(2, 0);
        opacity.setValueAtKey(3, 100);

        opacity.expression = expressions.lineOpacity;
        
    } else {
        alert("Надо сначала выбрать нужную композицию, потом запускать скрипт!");
    }
    app.endUndoGroup();
}

main();
