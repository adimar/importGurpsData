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
    cost:number;
    reference: string;
    category: string;
    modifiers: ModifierData[]
}



fs.readFile("../data/advantagesBasicSet.xml", "utf8", function (err, data) {

    xml2js.parseString(data, (err, rawAdvantages) => {
        let advantagesJson = _.reduce(rawAdvantages.advantage_list.advantage, (advantages: {[advId:string]:SysAdvantage}, singleAdvantage: any) => {
            let advId = _.camelCase(singleAdvantage.name[0]);
            if (advantages[advId]) {
               console.log("duplicate advantage");

            }

            let cost:number = (singleAdvantage.basePoints?
                    singleAdvantage.basePoints[0]:
                    singleAdvantage.points_per_level);
            var adv : SysAdvantage = {
                advId: advId,
                name: singleAdvantage.name[0],
                type: singleAdvantage.type[0],
                cost: cost ,
                reference: _.join(singleAdvantage.reference, ","),
                category: singleAdvantage.categories[0].category[0],
                modifiers: null,
            };

            advantages[advId] = adv;
            return advantages;
        }, {});
        writeJsonFile("raw-gurps-advantages.json","advId",advantagesJson);
    });
});
