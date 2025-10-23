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

var p = app.project;
var ac = p.activeSequence;
acvLen = ac.videoTracks.length;
for (var i = 0; i < acvLen; i++) {
    v = ac.videoTracks[i];
    cl = v.clips;
    for (var j = 0; j < cl.length; j++) {
        c = cl[j];
        log(c.name);
        cc = c.components;
        //for (var k = 0; k < cc.length; k++) {
         //   cmp = cc[k];
         //   log("\t" + cmp.displayName + " " + cmp.matchName);
         //   cmpp = cmp.properties;
         //   for (var l = 0; l < cmpp.length; l++) {
         //       p = cmpp[i];
         //       log("\t\t" + p.displayName);
                //log(1)     
         //   }
            
         //   log(1)
         
        //}
        
        log(1)
    }
    log(1)
 }


log(1)