import * as fs from 'fs';
import util = require('util')
import stream = require('stream')
import es = require('event-stream');

import * as _ from "lodash";
var advFS = fs.createWriteStream("../data/exaltedCharms4.txt", {
    flags: 'w',
    encoding: 'utf8'
});

export type CharmData = {
    id: string;
    name: string;
    cost: string;
    ability: string;
    abilityMin: number;
    essenceMin: number;
    type: string;
    keywords: string[];
    duration: string;
    prerequisites: string[];
}


let processCharmLine = (lines:string[]):CharmData=>{


    try{
        let charmName=lines[0];
        var costAndMin = _.split(lines[1],";");
        var cost = costAndMin[0].replace("Cost: ","");
        var mins = costAndMin[1].replace(" Mins: ","");
        var MinData = _.split(mins,",");
        var ability = _.camelCase(MinData[0].slice(0,-1).trim());
        var abilityMin = parseInt(MinData[0].slice(-1));
        var essenceMin = parseInt(MinData[1].replace(" Essence ",""));

        if(lines[3].indexOf("Keywords:")!==0) {
            console.log("Keywords not found "+lines);
        }
        var keywordsString = lines[3].replace("Keywords: ","");
        var keywordsArray = _.chain(keywordsString).split(",").map(word=>_.trim(word)).value();

        if(lines[4].indexOf("Duration")!==0) {
            console.log("Duration"+lines);
        }

        if(lines[5].indexOf("Prerequisite Charms")!==0) {
            console.log("Prerequisite Charms not found "+lines);
        }
        var preqsString =  lines[5].replace("Prerequisite Charms: ","");
        var preqaArray = _.chain(preqsString).split(",").map(word=>_.chain(word).trim().camelCase().value()).value();
        return {
            id: _.camelCase(charmName),
            name: charmName,
            cost: cost,
            ability: ability,
            abilityMin: abilityMin,
            essenceMin: essenceMin,
            type: lines[2].replace("Type: ",""),
            keywords: keywordsArray,
            duration:  lines[4].replace("Duration: ",""),
            prerequisites: preqaArray
        };
    }catch(e){
        console.log("ERROR:"+JSON.stringify(e));
        console.log(lines);
        return null;
    }


}




var charmLines:string[]=[];
var previousLine:string;
var s = fs.createReadStream("../data/Ex3CharmsText3.txt")
    .pipe(es.split(""))
    .pipe(es.mapSync(function (line:any) {
        s.pause();
        if(_.startsWith(line,"Cost")) {
            if(_.size(charmLines)>0) {
                var cleanCharmLines = _.dropRight(charmLines,1)
                //console.log(JSON.stringify(cleanCharmLines));

                if(_.size(cleanCharmLines)>3) {
                    var charmData = processCharmLine(cleanCharmLines);

                    if(charmData) {
                        advFS.write("\""+charmData.id+"\":");
                        advFS.write(JSON.stringify(charmData));
                        advFS.write(",\n");
                    }

                }


                charmLines = [previousLine];
            }
        }
        charmLines.push(line);
        previousLine=line;
        // pause the readstream

       // console.log(lineNr+" : "+line);

        s.resume();
    })
    .on('error', function (err:any) {
            console.log('Error while reading file.', err);
        advFS.end();
     })
        .on('end', function () {

            advFS.end();
            console.log('Read entire file.')
    })
 );