import { CONDITION } from "./conditions.js";
import { ASSIST_TYPE, COMBAT_FLAG, CONDITION_OPERATOR, EFFECT_ACTION, EFFECT_CALCULATION, EFFECT_CONDITION, EFFECT_PHASE, EFFECT_TARGET, MOVE_TYPE, MOVEMENT_TYPE, MOVEMENT_FLAG, SKILL_TYPE, SPECIAL_TYPE, STATS, WEAPON_TYPE, STAT_CHECK_TYPE, NON_STAVES, MELEE, RANGED, DRAGONS, BEASTS } from "./definitions.js";
import { EFFECT } from "./effects.js";
import STATUS from "./status.js";

const CAPTAIN_SKILLS = {
  ADROIT_CAPTAIN: {
    name: "Adroit Captain",
    description: "Grants Spd+5 to captain during combat.\nCaptain and allies within 2 spaces of captain receive: \"If Spd > foe's Spd, neutralizes effects that guarantee foe's follow-up attacks and prevent unit's follow-up attacks.\"",
    img: "assets/captainskills/Adroit_Captain.webp",
    type: SKILL_TYPE.CAPTAIN,
    effects: [
      EFFECT.inCombatStats({ spd: 5 }),
      EFFECT.spdBasedNfu(),
      EFFECT.driveSpdBasedNfu()
    ]
  },
  DAUNTLESS: {
    name: "Dauntless",
    description: "At the start of turns 2 through 5, grants Special cooldown charge +1 per attack to captain and allies within 2 spaces of captain for 1 turn and inflicts【Guard】on foes in cardinal directions of captain through their next actions.",
    img: "assets/captainskills/Dauntless.webp",
    type: SKILL_TYPE.CAPTAIN,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: CONDITION.or(
          { type: EFFECT_CONDITION.IS_TURN_COUNT, turnCount: 2 },
          { type: EFFECT_CONDITION.IS_TURN_COUNT, turnCount: 3 },
          { type: EFFECT_CONDITION.IS_TURN_COUNT, turnCount: 4 },
          { type: EFFECT_CONDITION.IS_TURN_COUNT, turnCount: 5 }
        ),
        actions: [
          { type: EFFECT_ACTION.APPLY_STATUS, status: STATUS.SPECIAL_CHARGES.id, target: { type: EFFECT_TARGET.UNIT_AND_ALLIES_WITHIN_X_SPACES, spaces: 2 } },
          { type: EFFECT_ACTION.APPLY_STATUS, status: STATUS.GUARD.id, target: { type: EFFECT_TARGET.FOES_IN_CARDINAL_DIRECTIONS } }
        ]
      }
    ]
  },
  EARTH_RENDERING: {
    name: "Earth Rendering",
    description: "At the start of turns 2-4, if your captain is in the Capture Area, the Capture Area will move one space closer to your team. (Red: moves up. Blue: moves down.)",
    img: "assets/captainskills/Earth_Rendering.webp",
    type: SKILL_TYPE.CAPTAIN,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_IN_CAPTURE_AREA },
          CONDITION.or(
            { type: EFFECT_CONDITION.IS_TURN_COUNT, turnCount: 2 },
            { type: EFFECT_CONDITION.IS_TURN_COUNT, turnCount: 3 },
            { type: EFFECT_CONDITION.IS_TURN_COUNT, turnCount: 4 }
          )
        ),
        actions: [{ type: EFFECT_ACTION.PULL_CAPTURE_AREA }]
      }
    ]
  },
  FLASH_OF_STEEL: {
    name: "Flash of Steel",
    description: "If captain initiates combat, captain can make a follow-up attack before foe can counterattack.\nGrants the following to captain and allies within 2 spaces of captain during combat: \"neutralizes effects that grant 'Special cooldown charge +X' to foe or inflict 'Special cooldown charge -X' on unit.\"",
    img: "assets/captainskills/Flash_of_Steel.webp",
    type: SKILL_TYPE.CAPTAIN,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.DESPERATION, target: { type: EFFECT_TARGET.SELF } }]
      },
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_SPECIAL_CHARGES, target: { type: EFFECT_TARGET.FOE } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_GUARD, target: { type: EFFECT_TARGET.SELF } }
        ]
      },
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2 },
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_SPECIAL_CHARGES, target: { type: EFFECT_TARGET.FOE } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_GUARD, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ]
  },
  MIGHT_OF_MIRIADS: {
    name: "Might of Miriads",
    description: "Grants Atk/Spd/Def/Res+6 to captain during combat. Captain can counterattack regardless of foe's range (excluding when unit's Savior skill triggers).",
    img: "assets/captainskills/Might_of_Myriads.webp",
    type: SKILL_TYPE.CAPTAIN,
    effects: [
      EFFECT.inCombatStats({ atk: 6, spd: 6, def: 6, res: 6 }),
      EFFECT.distantCloseCounter() // come back when savior skills implemented
    ]
  },
  TURMOIL: {
    name: "Turmoil",
    description: "At the start of the turn, captain can move 1 extra space. (That turn only. Does not stack.)\nCaptain counts as two Heroes for scoring purposes while in the Capture Area.",
    img: "assets/captainskills/Turmoil.webp",
    type: SKILL_TYPE.CAPTAIN,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [{ type: EFFECT_ACTION.APPLY_STATUS, status: STATUS.MOBILITY_INCREASED.id, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
}

Object.entries(CAPTAIN_SKILLS).forEach(([key, value]) => CAPTAIN_SKILLS[key] = { id: key, ...value });

export default CAPTAIN_SKILLS;
