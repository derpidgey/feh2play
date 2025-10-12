import { CONDITION } from "./conditions.js";
import { ASSIST_TYPE, COMBAT_FLAG, CONDITION_OPERATOR, EFFECT_ACTION, EFFECT_CALCULATION, EFFECT_CONDITION, EFFECT_PHASE, EFFECT_TARGET, MOVE_TYPE, MOVEMENT_TYPE, SKILL_TYPE, SPECIAL_TYPE, STAT_CHECK_TYPE, STATS, WEAPON_TYPE } from "./definitions.js";

export const EFFECT = {
  visibleStats: ({ hp = 0, atk = 0, spd = 0, def = 0, res = 0 }) => {
    const stats = { hp, atk, spd, def, res };

    return {
      phase: EFFECT_PHASE.ON_EQUIP,
      actions: Object.entries(stats)
        .filter(([, value]) => value !== 0)
        .map(([stat, value]) => ({ type: EFFECT_ACTION.EQUIP_STAT_MOD, stat, value }))
    };
  },
  phantom: (stat, value) => ({
    phase: EFFECT_PHASE.ON_EQUIP,
    actions: [{ type: EFFECT_ACTION.PHANTOM_STAT, stat, value }]
  }),
  playerPhaseStats: ({ hp = 0, atk = 0, spd = 0, def = 0, res = 0 }) => {
    const stats = { hp, atk, spd, def, res };

    return {
      phase: EFFECT_PHASE.START_OF_COMBAT,
      condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
      actions: Object.entries(stats)
        .filter(([, value]) => value !== 0)
        .map(([stat, value]) => ({ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat, value, target: { type: EFFECT_TARGET.SELF } }))
    }
  },
  enemyPhaseStats: ({ hp = 0, atk = 0, spd = 0, def = 0, res = 0 }) => {
    const stats = { hp, atk, spd, def, res };

    return {
      phase: EFFECT_PHASE.START_OF_COMBAT,
      condition: { type: EFFECT_CONDITION.FOE_INITIATES_COMBAT },
      actions: Object.entries(stats)
        .filter(([, value]) => value !== 0)
        .map(([stat, value]) => ({ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat, value, target: { type: EFFECT_TARGET.SELF } }))
    }
  },
  slaying: () => ({
    phase: EFFECT_PHASE.ON_EQUIP,
    actions: [{ type: EFFECT_ACTION.MAX_SPECIAL_COOLDOWN_MOD, value: -1 }]
  }),
  reverseSlaying: () => ({
    phase: EFFECT_PHASE.ON_EQUIP,
    actions: [{ type: EFFECT_ACTION.MAX_SPECIAL_COOLDOWN_MOD, value: 1 }]
  }),
  effectiveAgainstMoveType: moveType => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.EFFECTIVE_AGAINST_MOVE_TYPE, moveType, target: { type: EFFECT_TARGET.SELF } }]
  }),
  effectiveAgainstWeaponType: weaponType => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.EFFECTIVE_AGAINST_WEAPON_TYPE, weaponType, target: { type: EFFECT_TARGET.SELF } }]
  }),
  neutralizeEffectiveAgainstMoveType: moveType => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_EFFECTIVE_AGAINST_MOVE_TYPE, moveType, target: { type: EFFECT_TARGET.SELF } }]
  }),
  neutralizeEffectiveAgainstWeaponType: weaponType => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_EFFECTIVE_AGAINST_WEAPON_TYPE, weaponType, target: { type: EFFECT_TARGET.SELF } }]
  }),
  neutralizeMoveTypeBonuses: moveType => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    condition: { type: EFFECT_CONDITION.FOE_IS_MOVE_TYPE, moveType },
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_BONUSES, target: { type: EFFECT_TARGET.FOE } }]
  }),
  playerPhaseBrave: () => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.ATTACKS_TWICE, target: { type: EFFECT_TARGET.SELF } }]
  }),
  dagger: value => ({
    phase: EFFECT_PHASE.AFTER_COMBAT_BEFORE_DEATH,
    condition: { type: EFFECT_CONDITION.UNIT_ATTACKED_DURING_COMBAT },
    actions: [
      { type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.DEF, value, target: { type: EFFECT_TARGET.FOE_AND_FOES_WITHIN_X_SPACES_OF_FOE, spaces: 2 } },
      { type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.RES, value, target: { type: EFFECT_TARGET.FOE_AND_FOES_WITHIN_X_SPACES_OF_FOE, spaces: 2 } }
    ]
  }),
  blade: () => ({
    phase: EFFECT_PHASE.START_OF_COMBAT,
    actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, calculation: { type: EFFECT_CALCULATION.TOTAL_BONUSES_ON_UNIT }, target: { type: EFFECT_TARGET.SELF } }]
  }),
  adaptiveVsRanged: () => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    condition: { type: EFFECT_CONDITION.FOE_HAS_X_RANGE, range: 2 },
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CALCULATE_DAMAGE_USING_LOWER_OF_DEF_RES, target: { type: EFFECT_TARGET.SELF } }]
  }),
  postCombatSelfDamage: value => ({
    phase: EFFECT_PHASE.AFTER_COMBAT,
    actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, value, target: { type: EFFECT_TARGET.SELF } }]
  }),
  damageOnSpecialTrigger: value => ({
    phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
    actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, value }]
  }),
  triangleAdept: () => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.TRIANGLE_ADEPT, target: { type: EFFECT_TARGET.SELF } }]
  }),
  raven: () => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.WTA_VS_COLOURLESS, target: { type: EFFECT_TARGET.SELF } }]
  }),
  distantCloseCounter: () => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CAN_COUNTERATTACK_REGARDLESS_OF_FOES_RANGE, target: { type: EFFECT_TARGET.SELF } }]
  }),
  unitCantCounterattack: () => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_COUNTERATTACK, target: { type: EFFECT_TARGET.SELF } }]
  }),
  foeCantCounterattack: () => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_COUNTERATTACK, target: { type: EFFECT_TARGET.FOE } }]
  }),
  whitewingStats: () => ({
    phase: EFFECT_PHASE.START_OF_COMBAT,
    condition: { type: EFFECT_CONDITION.UNIT_WITHIN_X_SPACES_OF_ALLY, spaces: 2, moveType: MOVE_TYPE.FLIER.id, count: 2 },
    actions: [
      { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 3, target: { type: EFFECT_TARGET.SELF } },
      { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 3, target: { type: EFFECT_TARGET.SELF } },
      { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 3, target: { type: EFFECT_TARGET.SELF } },
      { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 3, target: { type: EFFECT_TARGET.SELF } }
    ]
  }),
  whitewingBrave: () => ({
    phase: EFFECT_PHASE.START_OF_COMBAT,
    condition: CONDITION.and(
      { type: EFFECT_CONDITION.UNIT_WITHIN_X_SPACES_OF_ALLY, spaces: 2, moveType: MOVE_TYPE.FLIER.id, count: 2 },
      { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT }
    ),
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.ATTACKS_TWICE, target: { type: EFFECT_TARGET.SELF } }]
  }),
  wrathful: () => ({
    phase: EFFECT_PHASE.BEFORE_COMBAT,
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.WRATHFUL, target: { type: EFFECT_TARGET.SELF } }]
  }),
  impact: () => ({
    phase: EFFECT_PHASE.START_OF_COMBAT,
    condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
    actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE } }]
  }),
  spdBasedNfu: () => ({
    phase: EFFECT_PHASE.DURING_COMBAT,
    condition: { type: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE, unitStat: STATS.SPD, foeStat: STATS.SPD, statType: STAT_CHECK_TYPE.IN_COMBAT },
    actions: [
      { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE } },
      { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } }
    ]
  }),
  driveSpdBasedNfu: () => ({
    phase: EFFECT_PHASE.DURING_ALLY_COMBAT,
    condition: CONDITION.or(
      { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2 },
      { type: EFFECT_CONDITION.ALLY_STAT_GREATER_THAN_FOE, allyStat: STATS.SPD, foeStat: STATS.SPD, statType: STAT_CHECK_TYPE.IN_COMBAT }
    ),
    actions: [
      { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE_IN_COMBAT } },
      { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
    ]
  })
};
