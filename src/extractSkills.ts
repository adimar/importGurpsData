import * as fs from 'fs';
import * as xml2js from 'xml2js';
import * as _ from "lodash";
import {writeJsonFile} from "./helpers";


export type SysSkillDefault = {
    type: string;
    name: string;
    modifier: number;
}
export type SysSkill = {
    skillId: string;
    name: string;
    attributeId: string;
    difficulty: string;
    reference: string;
    categories: string[];
    skillDefaults: SysSkillDefault[];
    attributeDefault: SysSkillDefault;
    specializations: string[];
    optionalSpecializations: string[];
}

let compileSkillEntry = function (singleSkill: any, skillId: string, skillName: any, difficulty: any) {
    let defaultsData = _.reduce(singleSkill.default, (data, defaultEntry: any) => {
         var def:SysSkillDefault = {
            type: (defaultEntry.name ? defaultEntry.type[0] : "Attribute"),
            name: _.camelCase((defaultEntry.name ? defaultEntry.name[0] : defaultEntry.type[0])),
            modifier: parseInt(defaultEntry.modifier[0])
        };


        data[ (defaultEntry.name ? "skillDefaults" : "attributeDefault")].push(def);
        return data;


    },{skillDefaults:[],attributeDefault:[]})


    let skillEntry: SysSkill = {
        skillId: skillId,
        name: skillName,
        attributeId: _.toLower(difficulty[0]),
        difficulty: difficulty[1],
        reference: _.join(singleSkill.reference, ","),
        categories: singleSkill.categories[0].category,
        skillDefaults: defaultsData.skillDefaults,
        attributeDefault: _.size(defaultsData.attributeDefault)>0?defaultsData.attributeDefault[0]:null,
        specializations: singleSkill.specialization || [],
        optionalSpecializations:[]

    };
    return skillEntry;
};

fs.readFile("../data/skillsBasicSet.xml", "utf8", function (err, data) {

    xml2js.parseString(data, (err, rawSkills) => {


        let skillsJson = _.reduce(rawSkills.skill_list.skill, (skills: { [skillId: string]: SysSkill }, singleSkill: any) => {
            let skillId = _.camelCase(singleSkill.name[0]);
            let skillName = singleSkill.name[0];
            let difficulty = _.split(singleSkill.difficulty[0], "/");
            console.log(skillId + "\n");
            if (!skills[skillId]) {
                skills[skillId] = compileSkillEntry(singleSkill, skillId, skillName, difficulty);
                return skills;
            }
            //skill already exists ?????
            if (_.size(singleSkill.specialization) > 1) {
                console.log("many specializations.");
            }

            if (_.toLower(difficulty[0]) !== skills[skillId].attributeId) {
                console.log("mismatched attributes.");


                //-skill 1 old skill-------------
                let skillId1 = _.camelCase(skills[skillId].name + _.replace(skills[skillId].specializations[0], "@", ""));
                skills[skillId].skillId = skillId1;
                skills[skillId].name = skills[skillId].name + skills[skillId].specializations[0].split(" ")[0]+"@";
                skills[skillId1] = _.cloneDeep(skills[skillId]);
                delete skills[skillId];

                //-skill 2 new skill-------------
                skillId = _.camelCase(singleSkill.name[0] + _.replace(singleSkill.specialization[0], "@", ""));
                skillName = singleSkill.name[0] + singleSkill.specialization[0].split(" ")[0]+"@";
                skills[skillId] = compileSkillEntry(singleSkill, skillId, skillName, difficulty);

            }
            else if (difficulty[1] !== skills[skillId].difficulty){
                console.log("mismatched difficulty.");
                skills[skillId].optionalSpecializations.push(singleSkill.specialization[0]);
            }
            else {
                console.log("add another specialization .");
                skills[skillId].specializations.push(singleSkill.specialization[0]);
            }



            return skills;
        },{});

        writeJsonFile("raw-gurps-skills.json","skillId",skillsJson);
    })
//------------------------------------------------------------------------------------------

})
