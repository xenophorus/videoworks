function processProperty(theProp) {
    if (theProp.propertyType == PropertyType.PROPERTY) {
        try {
            log(theProp.name + " " + theProp.value);
        } catch (e) {
            log(theProp.name + " " + "NO VALUE");
        }
        if (theProp.name === "Path") {
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
}


layers = app.project.activeItem;

nLayers = layers.numLayers;

var ltr = ["2-2", "3-2", "4-2", "2-3", "2-6", "2-4", "5-4", "2-5", "5-5", "2-6", "5-6", "2-7", "5-7", "2-8", 
           "3-8", "4-8", "7-2", "7-3", "7-4", "7-5", "7-6", "7-7", "7-8", "10-2", "10-3", "10-4", "10-5", "10-6", 
           "10-7", "10-8", "8-4", "9-5", "13-2", "14-2", "12-3", "15-3", "12-4", "13-5", "14-5", "15-6", "15-7", "14-8", "13-8", "12-7"];

for (var i = 1; i <= nLayers; i++) {
    var keyTime = 8.5;
    var pix = layers.layers[i];
    //var effs = pix.property("ADBE Effects Parade");
    var effs = pix.property("ADBE Effect Parade");
    //var effR = effs.property("r").property("Slider").setValueAtTime(keyTime, 100);
    //var effG = effs.property("g").property("Slider").setValueAtTime(keyTime, 100)
    //var effB = effs.property("b").property("Slider").setValueAtTime(keyTime, 100)
    //var effC = effs.property("crystals").property("Slider").setValueAtTime(keyTime, 0)
    
    var id = pix.name.split("_")[1];
    
    for (var j = 0; j < ltr.length; j++) {
        if (ltr[j] == id) {
            effs.property("crystals").property("Slider").setValueAtTime(keyTime + 0.5, 100)
        //} else {
         //   effs.property("crystals").property("Slider").setValueAtTime(keyTime + 0.5, 0)
        }
    
    }
        
    //var rk = effR.addKey(8);
    //var rg = effG.addKey(8);
    //var rb = effB.addKey(8);
    //var rc = effC.addKey(8);
    
    //effR.setValueAtKey(rk, effR.keyValue(rk - 1));
    //effG.setValueAtKey(rg, effG.keyValue(rg - 1));
    //effB.setValueAtKey(rb, effB.keyValue(rb - 1));
    //effC.setValueAtKey(rc, effC.keyValue(rc - 1));
       
    //processProperty(effR)
    
    log(i)
    
    

}