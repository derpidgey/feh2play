import { COMBAT_FLAG, EFFECT_ACTION, EFFECT_CONDITION, EFFECT_PHASE, EFFECT_TARGET, MOVEMENT_FLAG, STATUS_TYPE } from "./definitions.js";
import { EFFECT } from "./effects.js";

const STATUS = {
  GRAVITY: {
    name: "Gravity",
    description: "Restricts target's movement to 1 space through its next action.",
    type: STATUS_TYPE.NEGATIVE,
    effects: [
      {
        phase: EFFECT_PHASE.CALCULATE_OWN_MOVEMENT,
        actions: [{ type: EFFECT_ACTION.SET_MOVEMENT_FLAG, flag: MOVEMENT_FLAG.RESTRICT_MOVEMENT }]
      }
    ]
  },
  PANIC: {
    name: "Panic",
    description: "Converts bonuses on target into penalties through its next action.",
    type: STATUS_TYPE.NEGATIVE,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.PANIC, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  COUNTERATTACKS_DISRUPTED: {
    name: "Counterattacks Disrupted",
    description: "Unit cannot counterattack through its next action.",
    type: STATUS_TYPE.NEGATIVE,
    effects: [EFFECT.unitCantCounterattack()]
  },
  MOBILITY_INCREASED: {
    name: "Mobility increased",
    description: "Unit can move 1 extra space (that turn only; does not stack).",
    type: STATUS_TYPE.POSITIVE,
    effects: [
      {
        phase: EFFECT_PHASE.CALCULATE_OWN_MOVEMENT,
        actions: [{ type: EFFECT_ACTION.MOVE_EXTRA_SPACES, spaces: 1 }]
      }
    ]
  },
  TRIANGLE_ADEPT: {
    name: "Triangle Adept",
    description: "If unit has weapon-triangle advantage, boosts Atk by 20% through its next action, and if unit has weapon-triangle disadvantage, reduces Atk by 20% through its next action.",
    type: STATUS_TYPE.NEGATIVE,
    effects: [EFFECT.triangleAdept()]
  },
  GUARD: {
    name: "Guard",
    description: "Inflicts Special cooldown charge -1 on target per attack during combat through its next action. (Only highest value applied. Does not stack.)",
    type: STATUS_TYPE.NEGATIVE,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARD, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
}

Object.entries(STATUS).forEach(([key, value]) => STATUS[key] = { id: key, ...value });

export default STATUS;
