import * as fs from 'fs';
import * as xml2js from 'xml2js';
import * as _ from "lodash";
import {writeJsonFile} from "./helpers";

export type ModifierData = {
    name:string,
    type:string,
    value:number;
    affects:string;
    reference:string;
    notes:string;
}


export type SysAdvantage = {
    advId: string;
    name: string;
    type: string;
    basePoints:number;
    reference: string;
    categories: string[];
    modifiers: ModifierData[]
}



fs.readFile("../data/advantagesBasicSet.xml", "utf8", function (err, data) {

    xml2js.parseString(data, (err, rawAdvantages) => {

        let advantagesJson = _.reduce(rawAdvantages.advantage_list.advantage, (advantages: {[advId:string]:SysAdvantage}, singleAdvantage: any) => {

            return advantages;
        }, {});
        writeJsonFile("raw-gurps-advantages.json","advId",advantagesJson);
    });
});
