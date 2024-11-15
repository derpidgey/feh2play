import { ASSIST_TYPE, COMBAT_FLAG, CONDITION_OPERATOR, EFFECT_ACTION, EFFECT_CALCULATION, EFFECT_CONDITION, EFFECT_PHASE, EFFECT_TARGET, MOVE_TYPE, MOVEMENT_TYPE, SKILL_TYPE, SPECIAL_TYPE, STATS, WEAPON_TYPE } from "./definitions.js";

export const CONDITION = {
  and: (...conditions) => ({
    operator: CONDITION_OPERATOR.AND,
    conditions
  }),
  or: (...conditions) => ({
    operator: CONDITION_OPERATOR.OR,
    conditions
  })
}
