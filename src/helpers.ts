import * as fs from "fs";
import * as _ from "lodash";
export const writeJsonFile = function (fileName:string, idField:string, data: { [p: string]: any }) {
    console.log("writing file....");
    var advFS = fs.createWriteStream("../data/"+fileName, {
        flags: 'w',
        encoding: 'utf8'
    })
    advFS.write("{\n");


    var dataString = _.chain(data).map((entry: any) => {
        console.log("writing file...." + entry[idField]);
        return ("\"" + entry[idField] + "\":" + JSON.stringify(entry) + "\n");
    }).join(",").value();
    advFS.write(dataString);
    advFS.write("}");
    advFS.end();
    console.log("finished....");
};