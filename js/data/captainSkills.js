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
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 5, target: { type: EFFECT_TARGET.SELF } }]
      },
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
}

Object.entries(CAPTAIN_SKILLS).forEach(([key, value]) => CAPTAIN_SKILLS[key] = { id: key, ...value });

export default CAPTAIN_SKILLS;
