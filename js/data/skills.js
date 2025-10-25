import CAPTAIN_SKILLS from "./captainSkills.js";
import { CONDITION } from "./conditions.js";
import { ASSIST_TYPE, COMBAT_FLAG, EFFECT_ACTION, EFFECT_CALCULATION, EFFECT_CONDITION, EFFECT_PHASE, EFFECT_TARGET, MOVE_TYPE, MOVEMENT_TYPE, MOVEMENT_FLAG, SKILL_TYPE, SPECIAL_TYPE, STATS, WEAPON_TYPE, STAT_CHECK_TYPE, NON_STAVES, MELEE, RANGED, DRAGONS, BEASTS } from "./definitions.js";
import { EFFECT } from "./effects.js";
import STATUS from "./status.js";
import UNIT from "./units.js";
import WEAPON_SKILLS from "./weapons.js";

const ASSIST_SKILLS = {
  PHYSIC_PLUS: {
    name: "Physic+",
    description: "Restores HP = 50% of Atk. (Minimum of 8 HP.) Range = 2.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.HEAL,
    range: 2,
    heal: {
      calculations: [{ type: EFFECT_CALCULATION.PERCENT_OF_STAT, stat: STATS.ATK, percent: 50 }],
      min: 8
    },
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  },
  RECOVER_PLUS: {
    name: "Recover+",
    description: "Restores HP = 50% of Atk +10. (Minimum of 15 HP.)",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.HEAL,
    range: 1,
    heal: {
      calculations: [
        { type: EFFECT_CALCULATION.PERCENT_OF_STAT, stat: STATS.ATK, percent: 50 },
        { type: EFFECT_CALCULATION.VALUE, value: 10 }
      ],
      min: 15
    },
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  },
  MARTYR_PLUS: {
    name: "Martyr+",
    description: "Restores HP = damage dealt to unit +50% of Atk. (Minimum of 7 HP.) Restores HP to unit = half damage dealt to unit.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.HEAL,
    range: 1,
    heal: {
      calculations: [{ type: EFFECT_CALCULATION.PERCENT_OF_STAT, stat: STATS.ATK, percent: 50 }],
      min: 7
    },
    selfHeal: {
      calculations: [{ type: EFFECT_CALCULATION.MISSING_HP, percent: 50 }]
    },
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  },
  REHABILITATE_PLUS: {
    name: "Rehabilitate+",
    description: "Restores HP = 50% of Atk -10. (Minimum of 7 HP.) If target's HP is ≤ 50%, the lower the target's HP, the more HP is restored.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.HEAL,
    range: 1,
    heal: {
      calculations: [
        { type: EFFECT_CALCULATION.PERCENT_OF_STAT, stat: STATS.ATK, percent: 50 },
        { type: EFFECT_CALCULATION.VALUE, value: -10 },
        { type: EFFECT_CALCULATION.LOW_HP_BOOST }
      ],
      min: 7
    },
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  },
  SWAP: {
    name: "Swap",
    description: "Unit and target ally swap spaces.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.MOVEMENT,
    movementAssist: MOVEMENT_TYPE.SWAP,
    range: 1,
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SHOVE: {
    name: "Shove",
    description: "Pushes target ally 1 space away.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.MOVEMENT,
    movementAssist: MOVEMENT_TYPE.SHOVE,
    range: 1,
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SMITE: {
    name: "Smite",
    description: "Pushes target ally 2 spaces away.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.MOVEMENT,
    movementAssist: MOVEMENT_TYPE.SMITE,
    range: 1,
    canUse: {
      weaponType: NON_STAVES
    }
  },
  DRAW_BACK: {
    name: "Draw Back",
    description: "Unit moves 1 space away from target ally. Ally moves to unit's previous space.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.MOVEMENT,
    movementAssist: MOVEMENT_TYPE.DRAW_BACK,
    range: 1,
    canUse: {
      weaponType: NON_STAVES
    }
  },
  REPOSITION: {
    name: "Reposition",
    description: "Target ally moves to opposite side of unit.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.MOVEMENT,
    movementAssist: MOVEMENT_TYPE.REPOSITION,
    range: 1,
    canUse: {
      weaponType: NON_STAVES
    }
  },
  PIVOT: {
    name: "Pivot",
    description: "Unit moves to opposite side of target ally.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.MOVEMENT,
    movementAssist: MOVEMENT_TYPE.PIVOT,
    range: 1,
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SING: {
    name: "Sing",
    description: "Grants another action to target ally.(Cannot target an ally with Sing or Dance.)",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.REFRESH,
    range: 1,
    canUse: {
      unit: [UNIT.AZURA.id]
    }
  },
  DANCE: {
    name: "Dance",
    description: "Grants another action to target ally.(Cannot target an ally with Sing or Dance.)",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.REFRESH,
    range: 1,
    canUse: {
      unit: [UNIT.OLIVIA.id]
    }
  },
  RALLY_ATTACK: {
    name: "Rally Attack",
    description: "Grants Atk+4 to target ally for 1 turn.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.RALLY,
    range: 1,
    rallyBuffs: [{ stat: STATS.ATK, value: 4 }],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  RALLY_SPEED: {
    name: "Rally Speed",
    description: "Grants Spd+4 to target ally for 1 turn.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.RALLY,
    range: 1,
    rallyBuffs: [{ stat: STATS.SPD, value: 4 }],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  RALLY_RES: {
    name: "Rally Defense",
    description: "Grants Def+4 to target ally for 1 turn.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.RALLY,
    range: 1,
    rallyBuffs: [{ stat: STATS.DEF, value: 4 }],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  RALLY_RESISTANCE: {
    name: "Rally Resistance",
    description: "Grants Res+4 to target ally for 1 turn.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.RALLY,
    range: 1,
    rallyBuffs: [{ stat: STATS.RES, value: 4 }],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  RALLY_ATK_SPD: {
    name: "Rally Atk/Spd",
    description: "Grants Atk/Spd+3 to target ally for 1 turn.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.RALLY,
    range: 1,
    rallyBuffs: [{ stat: STATS.ATK, value: 3 }, { stat: STATS.SPD, value: 3 }],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  RALLY_ATK_DEF: {
    name: "Rally Atk/Def",
    description: "Grants Atk/Def+3 to target ally for 1 turn.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.RALLY,
    range: 1,
    rallyBuffs: [{ stat: STATS.ATK, value: 3 }, { stat: STATS.DEF, value: 3 }],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  RALLY_ATK_RES: {
    name: "Rally Atk/Res",
    description: "Grants Atk/Res+3 to target ally for 1 turn.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.RALLY,
    range: 1,
    rallyBuffs: [{ stat: STATS.ATK, value: 3 }, { stat: STATS.RES, value: 3 }],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  RALLY_SPD_DEF: {
    name: "Rally Spd/Def",
    description: "Grants Spd/Def+3 to target ally for 1 turn.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.RALLY,
    range: 1,
    rallyBuffs: [{ stat: STATS.SPD, value: 3 }, { stat: STATS.DEF, value: 3 }],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  RALLY_SPD_RES: {
    name: "Rally Spd/Res",
    description: "Grants Spd/Res+3 to target ally for 1 turn.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.RALLY,
    range: 1,
    rallyBuffs: [{ stat: STATS.SPD, value: 3 }, { stat: STATS.RES, value: 3 }],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  RALLY_DEF_RES: {
    name: "Rally Def/Res",
    description: "Grants Def/Res+3 to target ally for 1 turn.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.RALLY,
    range: 1,
    rallyBuffs: [{ stat: STATS.DEF, value: 3 }, { stat: STATS.RES, value: 3 }],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  ARDENT_SACRIFICE: {
    name: "Ardent Sacrifice",
    description: "Restores 10 HP to target ally. Unit loses 10 HP but cannot go below 1.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.SACRIFICE,
    range: 1,
    amount: 10,
    canUse: {
      weaponType: NON_STAVES
    }
  },
  RECIPROCAL_AID: {
    name: "Reciprocal Aid",
    description: "Unit and target ally swap HP. (Neither can go above their max HP.)",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.RECIPROCAL_AID,
    range: 1,
    canUse: {
      weaponType: NON_STAVES
    }
  },
  HARSH_COMMAND: {
    name: "Harsh Command",
    description: "Converts penalties on target into bonuses.",
    type: SKILL_TYPE.ASSIST,
    assistType: ASSIST_TYPE.HARSH_COMMAND,
    range: 1,
    canUse: {
      weaponType: NON_STAVES
    }
  }
};

const SPECIAL_SKILLS = {
  NOONTIME: {
    name: "Noontime",
    description: "Restores HP = 30% of damage dealt.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 2,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.RESTORE_HP, calculation: { type: EFFECT_CALCULATION.PERCENT_DAMAGE_DEALT, percent: 30 } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SOL: {
    name: "Sol",
    description: "Restores HP = 50% of damage dealt.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 3,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.RESTORE_HP, calculation: { type: EFFECT_CALCULATION.PERCENT_DAMAGE_DEALT, percent: 50 } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  MOONBOW: {
    name: "Moonbow",
    description: "Treats foe's Def/Res as if reduced by 30% during combat.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 2,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.REDUCE_DEF_RES_BY, percent: 30 }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  LUNA: {
    name: "Luna",
    description: "Treats foe's Def/Res as if reduced by 50% during combat.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 3,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.REDUCE_DEF_RES_BY, percent: 50 }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  BLACK_LUNA: {
    name: "Black Luna",
    description: "Treats foe's Def/Res as if reduced by 80% during combat. (Skill cannot be inherited.)",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 3,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.REDUCE_DEF_RES_BY, percent: 80 }]
      }
    ],
    canUse: {
      unit: [] // bk, zelgius
    }
  },
  AETHER: {
    name: "Aether",
    description: "Treats foe's Def/Res as if reduced by 50% during combat. Restores HP = half of damage dealt.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 5,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [
          { type: EFFECT_ACTION.REDUCE_DEF_RES_BY, percent: 50 },
          { type: EFFECT_ACTION.RESTORE_HP, calculation: { type: EFFECT_CALCULATION.PERCENT_DAMAGE_DEALT, percent: 50 } }
        ]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  GLIMMER: {
    name: "Glimmer",
    description: "Boosts damage dealt by 50%.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 2,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.BASE_DAMAGE_INCREASE, percent: 50 }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  ASTRA: {
    name: "Astra",
    description: "Boosts damage dealt by 150%.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 4,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.BASE_DAMAGE_INCREASE, percent: 150 }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  REGNAL_ASTRA: {
    name: "Regnal Astra",
    description: "Boosts damage by 40% of unit's Spd. (Skill cannot be inherited.)",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 2,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, calculation: { type: EFFECT_CALCULATION.PERCENT_OF_STAT, percent: 40, stat: STATS.SPD } }]
      }
    ],
    canUse: {
      unit: [] // ayra
    }
  },
  REPRISAL: {
    name: "Reprisal",
    description: "Boosts damage by 30% of damage dealt to unit.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 2,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, calculation: { type: EFFECT_CALCULATION.MISSING_HP, percent: 30 } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  VENGEANCE: {
    name: "Vengeance",
    description: "Boosts damage by 50% of damage dealt to unit.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 3,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, calculation: { type: EFFECT_CALCULATION.MISSING_HP, percent: 50 } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  DRACONIC_AURA: {
    name: "Draconic Aura",
    description: "Boosts damage by 30% of unit's Atk.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 3,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, calculation: { type: EFFECT_CALCULATION.PERCENT_OF_STAT, percent: 30, stat: STATS.ATK } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  DRACON_FANG: {
    name: "Dragon Fang",
    description: "Boosts damage by 50% of unit's Atk.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 4,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, calculation: { type: EFFECT_CALCULATION.PERCENT_OF_STAT, percent: 50, stat: STATS.ATK } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  BONFIRE: {
    name: "Bonfire",
    description: "Boosts damage by 50% of unit's Def.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 3,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, calculation: { type: EFFECT_CALCULATION.PERCENT_OF_STAT, percent: 50, stat: STATS.DEF } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  IGNIS: {
    name: "Ignis",
    description: "Boosts damage by 80% of unit's Def.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 4,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, calculation: { type: EFFECT_CALCULATION.PERCENT_OF_STAT, percent: 80, stat: STATS.DEF } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  ICEBERG: {
    name: "Iceberg",
    description: "Boosts damage by 50% of unit's Res.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 3,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, calculation: { type: EFFECT_CALCULATION.PERCENT_OF_STAT, percent: 50, stat: STATS.RES } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  GLACIES: {
    name: "Glacies",
    description: "Boosts damage by 80% of unit's Res.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.OFFENSIVE,
    cooldown: 4,
    effects: [
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, calculation: { type: EFFECT_CALCULATION.PERCENT_OF_STAT, percent: 80, stat: STATS.RES } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  ESCUTCHEON: {
    name: "Escutcheon",
    description: "Reduces damage from an adjacent foe's attack by 30%.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.DEFENSIVE,
    cooldown: 2,
    triggerCondition: { type: EFFECT_CONDITION.FOE_HAS_X_RANGE, range: 1 },
    effects: [
      {
        phase: EFFECT_PHASE.ON_DEFENSIVE_SPECIAL_TRIGGER,
        condition: { type: EFFECT_CONDITION.FOE_HAS_X_RANGE, range: 1 },
        actions: [{ type: EFFECT_ACTION.DAMAGE_REDUCTION, percent: 30 }]
      }
    ],
    canUse: {
      weaponType: MELEE
    }
  },
  PAVISE: {
    name: "Pavise",
    description: "Reduces damage from an adjacent foe's attack by 50%.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.DEFENSIVE,
    cooldown: 3,
    triggerCondition: { type: EFFECT_CONDITION.FOE_HAS_X_RANGE, range: 1 },
    effects: [
      {
        phase: EFFECT_PHASE.ON_DEFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DAMAGE_REDUCTION, percent: 50 }]
      }
    ],
    canUse: {
      weaponType: MELEE
    }
  },
  SACRED_COWL: {
    name: "Sacred Cowl",
    description: "If foe is 2 spaces from unit, reduces damage from foe's attack by 30%.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.DEFENSIVE,
    cooldown: 2,
    triggerCondition: { type: EFFECT_CONDITION.FOE_HAS_X_RANGE, range: 2 },
    effects: [
      {
        phase: EFFECT_PHASE.ON_DEFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DAMAGE_REDUCTION, percent: 30 }]
      }
    ],
    canUse: {
      weaponType: MELEE
    }
  },
  AEGIS: {
    name: "Aegis",
    description: "If foe is 2 spaces from unit, reduces damage from foe's attack by 50%.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.DEFENSIVE,
    cooldown: 3,
    triggerCondition: { type: EFFECT_CONDITION.FOE_HAS_X_RANGE, range: 2 },
    effects: [
      {
        phase: EFFECT_PHASE.ON_DEFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DAMAGE_REDUCTION, percent: 50 }]
      }
    ],
    canUse: {
      weaponType: MELEE
    }
  },
  MIRACLE: {
    name: "Miracle",
    description: "If unit's HP > 1 and foe would reduce unit's HP to 0, unit survives with 1 HP.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.MIRACLE,
    cooldown: 5
  },
  GALEFORCE: {
    name: "Galeforce",
    description: "If unit initiates combat, grants unit another action after combat. (Once per turn.)",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.GALEFORCE,
    cooldown: 5,
    canUse: {
      weaponType: [
        WEAPON_TYPE.SWORD.id, WEAPON_TYPE.LANCE.id, WEAPON_TYPE.AXE.id,
        WEAPON_TYPE.RED_BEAST.id, WEAPON_TYPE.BLUE_BEAST.id, WEAPON_TYPE.GREEN_BEAST.id, WEAPON_TYPE.C_BEAST.id
      ]
    }
  },
  BLAZING_FLAME: {
    name: "Blazing Flame",
    description: "Before combat this unit initiates, foes in an area near target take damage equal to 1.5 x (unit's Atk minus foe's Def or Res).",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.AOE,
    cooldown: 4,
    aoe: {
      shape: [
        { x: -2, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 }
      ],
      multiplier: 1.5
    },
    canUse: {
      weaponType: NON_STAVES
    }
  },
  GROWING_FLAME: {
    name: "Growing Flame",
    description: "Before combat this unit initiates, foes in a wide area around target take damage equal to (unit's Atk minus foe's Def or Res).",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.AOE,
    cooldown: 4,
    aoe: {
      shape: [
        { x: -2, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 },
        { x: 1, y: 1 }
      ],
      multiplier: 1
    },
    canUse: {
      weaponType: NON_STAVES
    }
  },
  BLAZING_LIGHT: {
    name: "Blazing Light",
    description: "Before combat this unit initiates, foes in an area near target take damage equal to 1.5 x (unit's Atk minus foe's Def or Res).",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.AOE,
    cooldown: 4,
    aoe: {
      shape: [
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: 0, y: 0 },
        { x: -1, y: 1 },
        { x: 1, y: 1 }
      ],
      multiplier: 1.5
    },
    canUse: {
      weaponType: NON_STAVES
    }
  },
  GROWING_Light: {
    name: "Growing Light",
    description: "Before combat this unit initiates, foes in a wide area around target take damage equal to (unit's Atk minus foe's Def or Res).",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.AOE,
    cooldown: 4,
    aoe: {
      shape: [
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: 0, y: 0 },
        { x: -1, y: 1 },
        { x: 1, y: 1 },
        { x: -2, y: 0 },
        { x: 0, y: -2 },
        { x: 2, y: 0 },
        { x: 0, y: 2 }
      ],
      multiplier: 1
    },
    canUse: {
      weaponType: NON_STAVES
    }
  },
  BLAZING_THUNDER: {
    name: "Blazing Thunder",
    description: "Before combat this unit initiates, foes in an area near target take damage equal to 1.5 x (unit's Atk minus foe's Def or Res).",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.AOE,
    cooldown: 4,
    aoe: {
      shape: [
        { x: 0, y: -2 },
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 2, y: 2 }
      ],
      multiplier: 1.5
    },
    canUse: {
      weaponType: NON_STAVES
    }
  },
  GROWING_THUNDER: {
    name: "Growing Thunder",
    description: "Before combat this unit initiates, foes in a wide area around target take damage equal to (unit's Atk minus foe's Def or Res).",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.AOE,
    cooldown: 4,
    aoe: {
      shape: [
        { x: 0, y: -3 },
        { x: 0, y: -2 },
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 2, y: 2 },
        { x: 0, y: 3 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
      ],
      multiplier: 1
    },
    canUse: {
      weaponType: NON_STAVES
    }
  },
  BLAZING_WIND: {
    name: "Blazing Wind",
    description: "Before combat this unit initiates, foes in an area near target take damage equal to 1.5 x (unit's Atk minus foe's Def or Res).",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.AOE,
    cooldown: 4,
    aoe: {
      shape: [
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 }
      ],
      multiplier: 1.5
    },
    canUse: {
      weaponType: NON_STAVES
    }
  },
  GROWING_WIND: {
    name: "Growing Wind",
    description: "Before combat this unit initiates, foes in a wide area around target take damage equal to (unit's Atk minus foe's Def or Res).",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.AOE,
    cooldown: 4,
    aoe: {
      shape: [
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 },
        { x: 1, y: 1 }
      ],
      multiplier: 1
    },
    canUse: {
      weaponType: NON_STAVES
    }
  },
  HEAVENLY_LIGHT: {
    name: "Heavenly Light",
    description: "When healing an ally with a staff, restores 10 HP to all allies.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.HEALING,
    cooldown: 2,
    effects: [
      {
        phase: EFFECT_PHASE.ON_HEALING_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.RESTORE_HP, value: 10, target: { type: EFFECT_TARGET.ALL_ALLIES } }]
      }
    ],
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  },
  KINDLED_FIRE_BALM: {
    name: "Kindled-Fire Balm",
    description: "When healing an ally with a staff, grants Atk+4 to all allies for 1 turn.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.HEALING,
    cooldown: 2,
    effects: [
      {
        phase: EFFECT_PHASE.ON_HEALING_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 4, target: { type: EFFECT_TARGET.ALL_ALLIES } }]
      }
    ],
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  },
  SWIFT_WINDS_BALM: {
    name: "Swift-Winds Balm",
    description: "When healing an ally with a staff, grants Spd+4 to all allies for 1 turn.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.HEALING,
    cooldown: 2,
    effects: [
      {
        phase: EFFECT_PHASE.ON_HEALING_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 4, target: { type: EFFECT_TARGET.ALL_ALLIES } }]
      }
    ],
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  },
  SOLID_EARTH_BALM: {
    name: "Solid-Earth Balm",
    description: "When healing an ally with a staff, grants Def+4 to all allies for 1 turn.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.HEALING,
    cooldown: 2,
    effects: [
      {
        phase: EFFECT_PHASE.ON_HEALING_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.ALL_ALLIES } }]
      }
    ],
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  },
  STILL_WATER_BALM: {
    name: "Still-Water Balm",
    description: "When healing an ally with a staff, grants Res+4 to all allies for 1 turn.",
    type: SKILL_TYPE.SPECIAL,
    specialType: SPECIAL_TYPE.HEALING,
    cooldown: 2,
    effects: [
      {
        phase: EFFECT_PHASE.ON_HEALING_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.ALL_ALLIES } }]
      }
    ],
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  }
};

const A_SKILLS = {
  FURY_3: {
    name: "Fury 3",
    description: "Grants Atk/Spd/Def/Res+3. After combat, deals 6 damage to unit.",
    img: "assets/skills/Fury_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ atk: 3, spd: 3, def: 3, res: 3 }), EFFECT.postCombatSelfDamage(6)],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  HP_PLUS_5: {
    name: "HP +5",
    description: "Grants HP+5.",
    img: "assets/skills/HP_Plus_5.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ hp: 5 })]
  },
  ATTACK_PLUS_3: {
    name: "Attack +3",
    description: "Grants Atk+3.",
    img: "assets/skills/Attack_Plus_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ atk: 3 })]
  },
  SPEED_PLUS_3: {
    name: "Speed +3",
    description: "Grants Spd+3.",
    img: "assets/skills/Speed_Plus_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ spd: 3 })]
  },
  DEFENSE_PLUS_3: {
    name: "Defense +3",
    description: "Grants Def+3.",
    img: "assets/skills/Defense_Plus_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ def: 3 })]
  },
  RESISTANCE_PLUS_3: {
    name: "Resistance +3",
    description: "Grants Res+3.",
    img: "assets/skills/Resistance_Plus_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ res: 3 })]
  },
  HP_ATK_2: {
    name: "HP/Atk 2",
    description: "Grants HP+4, Atk+2.",
    img: "assets/skills/HP_Atk_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ hp: 5, atk: 2 })]
  },
  HP_SPD_2: {
    name: "HP/Spd 2",
    description: "Grants HP+4, Spd+2.",
    img: "assets/skills/HP_Spd_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ hp: 5, spd: 2 })]
  },
  HP_DEF_2: {
    name: "HP/Def 2",
    description: "Grants HP+4, Def+2.",
    img: "assets/skills/HP_Def_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ hp: 5, def: 2 })]
  },
  HP_RES_2: {
    name: "HP/Res 2",
    description: "Grants HP+4, Res+2.",
    img: "assets/skills/HP_Res_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ hp: 5, res: 2 })]
  },
  ATK_SPD_2: {
    name: "Atk/Spd 2",
    description: "Grants Atk/Spd+2.",
    img: "assets/skills/Atk_Spd_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ atk: 2, spd: 2 })]
  },
  ATK_DEF_2: {
    name: "Atk/Def 2",
    description: "Grants Atk/Def+2.",
    img: "assets/skills/Atk_Def_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ atk: 2, def: 2 })]
  },
  ATK_RES_2: {
    name: "Atk/Res 2",
    description: "Grants Atk/Res+2.",
    img: "assets/skills/Attack_Res_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ atk: 2, res: 2 })]
  },
  SPD_DEF_2: {
    name: "Spd/Def 2",
    description: "Grants Spd/Def+2.",
    img: "assets/skills/Spd_Def_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ spd: 2, def: 2 })]
  },
  SPD_RES_2: {
    name: "Spd/Res 2",
    description: "Grants Spd/Res+2.",
    img: "assets/skills/Spd_Res_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ spd: 2, res: 2 })]
  },
  DEF_RES_2: {
    name: "Def/Res 2",
    description: "Grants Def/Res+2.",
    img: "assets/skills/Def_Res_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ def: 2, res: 2 })]
  },
  FORTRESS_DEF_3: {
    name: "Fortress Def 3",
    description: "Grants Def+5. Inflicts Atk-3.",
    img: "assets/skills/Fortress_Def_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ def: 5, atk: -3 })]
  },
  FORTRESS_RES_3: {
    name: "Fortress Res 3",
    description: "Grants Res+5. Inflicts Atk-3.",
    img: "assets/skills/Fortress_Res_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ res: 5, atk: -3 })]
  },
  LIFE_AND_DEATH_3: {
    name: "Life and Death 3",
    description: "Grants Atk/Spd+5. Inflicts Def/Res-5.",
    img: "assets/skills/Life_and_Death_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.visibleStats({ atk: 5, spd: 5, def: -5, res: -5 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  DEATH_BLOW_3: {
    name: "Death Blow 3",
    description: "If unit initiates combat, grants Atk+6 during combat.",
    img: "assets/skills/Death_Blow_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.playerPhaseStats({ atk: 6 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  DARTING_BLOW_3: {
    name: "Darting Blow 3",
    description: "If unit initiates combat, grants Spd+6 during combat.",
    img: "assets/skills/Darting_Blow_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.playerPhaseStats({ spd: 6 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  ARMOURED_BLOW_3: {
    name: "Armoured Blow 3",
    description: "If unit initiates combat, grants Def+6 during combat.",
    img: "assets/skills/Armoured_Blow_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.playerPhaseStats({ def: 6 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  WARDING_BLOW_3: {
    name: "Warding Blow 3",
    description: "If unit initiates combat, grants Res+6 during combat.",
    img: "assets/skills/Warding_Blow_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.playerPhaseStats({ res: 6 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SWIFT_SPARROW_2: {
    name: "Swift Sparrow 2",
    description: "If unit initiates combat, grants Atk/Spd+4 during combat.",
    img: "assets/skills/Swift_Sparrow_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.playerPhaseStats({ atk: 4, spd: 4 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  STURDY_BLOW_2: {
    name: "Sturdy Blow 2",
    description: "If unit initiates combat, grants Atk/Def+4 during combat.",
    img: "assets/skills/Sturdy_Blow_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.playerPhaseStats({ atk: 4, def: 4 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  MIRROR_STRIKE_2: {
    name: "Mirror Strike 2",
    description: "If unit initiates combat, grants Atk/Res+4 during combat.",
    img: "assets/skills/Mirror_Strike_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.playerPhaseStats({ atk: 4, res: 4 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  STEADY_BLOW_2: {
    name: "Steady Blow 2",
    description: "If unit initiates combat, grants Spd/Def+4 during combat.",
    img: "assets/skills/Steady_Blow_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.playerPhaseStats({ spd: 4, def: 4 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SWIFT_STRIKE_2: {
    name: "Swift Strike 2",
    description: "If unit initiates combat, grants Spd/Res+4 during combat.",
    img: "assets/skills/Swift_Strike_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.playerPhaseStats({ spd: 4, res: 4 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  BRACING_BLOW_2: {
    name: "Bracing Blow 2",
    description: "If unit initiates combat, grants Def/Res+4 during combat.",
    img: "assets/skills/Bracing_Blow_2.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.playerPhaseStats({ def: 4, res: 4 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  FIERCE_STANCE_3: {
    name: "Fierce Stance 3",
    description: "If foe initiates combat, grants Atk+6 during combat.",
    img: "assets/skills/Fierce_Stance_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.enemyPhaseStats({ atk: 6 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  DARTING_STANCE_3: {
    name: "Darting Stance 3",
    description: "If foe initiates combat, grants Spd+6 during combat.",
    img: "assets/skills/Darting_Stance_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.enemyPhaseStats({ spd: 6 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  STEADY_STANCE_3: {
    name: "Steady Stance 3",
    description: "If foe initiates combat, grants Def+6 during combat.",
    img: "assets/skills/Steady_Stance_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.enemyPhaseStats({ def: 6 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  WARDING_STANCE_3: {
    name: "Warding Stance 3",
    description: "If foe initiates combat, grants Res+6 during combat.",
    img: "assets/skills/Warding_Stance_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.enemyPhaseStats({ res: 6 })],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  FIERCE_BREATH: {
    name: "Fierce Breath",
    description: "If foe initiates combat, grants Atk+4 during combat and Special cooldown charge +1 per attack. (Only highest value applied. Does not stack.)",
    img: "assets/skills/Fierce_Breath.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.FOE_INITIATES_COMBAT },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 4, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.SPECIAL_CHARGES_PER_ATTACK, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ],
    canUse: {
      weaponType: MELEE,
      moveType: [MOVE_TYPE.INFANTRY.id, MOVE_TYPE.ARMOURED.id]
    }
  },
  DARTING_BREATH: {
    name: "Darting Breath",
    description: "If foe initiates combat, grants Spd+4 during combat and Special cooldown charge +1 per attack. (Only highest value applied. Does not stack.)",
    img: "assets/skills/Darting_Breath.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.FOE_INITIATES_COMBAT },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 4, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.SPECIAL_CHARGES_PER_ATTACK, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ],
    canUse: {
      weaponType: MELEE,
      moveType: [MOVE_TYPE.INFANTRY.id, MOVE_TYPE.ARMOURED.id]
    }
  },
  STEADY_BREATH: {
    name: "Steady Breath",
    description: "If foe initiates combat, grants Def+4 during combat and Special cooldown charge +1 per attack. (Only highest value applied. Does not stack.)",
    img: "assets/skills/Steady_Breath.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.FOE_INITIATES_COMBAT },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.SPECIAL_CHARGES_PER_ATTACK, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ],
    canUse: {
      weaponType: MELEE,
      moveType: [MOVE_TYPE.INFANTRY.id, MOVE_TYPE.ARMOURED.id]
    }
  },
  WARDING_BREATH: {
    name: "Warding Breath",
    description: "If foe initiates combat, grants Res+4 during combat and Special cooldown charge +1 per attack. (Only highest value applied. Does not stack.)",
    img: "assets/skills/Warding_Breath.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.FOE_INITIATES_COMBAT },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.SPECIAL_CHARGES_PER_ATTACK, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ],
    canUse: {
      weaponType: MELEE,
      moveType: [MOVE_TYPE.INFANTRY.id, MOVE_TYPE.ARMOURED.id]
    }
  },
  DEFIANT_ATK_3: {
    name: "Defiant Atk 3",
    description: "At start of turn, if unit's HP ≤ 50%, grants Atk+7 for 1 turn.",
    img: "assets/skills/Defiant_Atk_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: { type: EFFECT_CONDITION.UNIT_HP_LESS_THAN_EQUAL_TO, percent: 50 },
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 7, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  DEFIANT_SPD_3: {
    name: "Defiant Spd 3",
    description: "At start of turn, if unit's HP ≤ 50%, grants Spd+7 for 1 turn.",
    img: "assets/skills/Defiant_Spd_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: { type: EFFECT_CONDITION.UNIT_HP_LESS_THAN_EQUAL_TO, percent: 50 },
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 7, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  DEFIANT_DEF_3: {
    name: "Defiant Def 3",
    description: "At start of turn, if unit's HP ≤ 50%, grants Def+7 for 1 turn.",
    img: "assets/skills/Defiant_Def_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: { type: EFFECT_CONDITION.UNIT_HP_LESS_THAN_EQUAL_TO, percent: 50 },
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 7, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  DEFIANT_RES_3: {
    name: "Defiant Res 3",
    description: "At start of turn, if unit's HP ≤ 50%, grants Res+7 for 1 turn.",
    img: "assets/skills/Defiant_Res_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: { type: EFFECT_CONDITION.UNIT_HP_LESS_THAN_EQUAL_TO, percent: 50 },
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 7, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  TRIANGLE_ADEPT_3: {
    name: "Triangle Adept 3",
    description: "If unit has weapon-triangle advantage, boosts Atk by 20%. If unit has weapon-triangle disadvantage, reduces Atk by 20%.",
    img: "assets/skills/Triangle_Adept_3.webp",
    type: SKILL_TYPE.A,
    effects: [EFFECT.triangleAdept()],
    canUse: {
      weaponType: [
        WEAPON_TYPE.SWORD.id, WEAPON_TYPE.LANCE.id, WEAPON_TYPE.AXE.id,
        WEAPON_TYPE.RED_BREATH.id, WEAPON_TYPE.BLUE_BREATH.id, WEAPON_TYPE.GREEN_BREATH.id,
        WEAPON_TYPE.RED_BEAST.id, WEAPON_TYPE.BLUE_BEAST.id, WEAPON_TYPE.GREEN_BEAST.id,
        WEAPON_TYPE.RED_BOW.id, WEAPON_TYPE.BLUE_BOW.id, WEAPON_TYPE.GREEN_BOW.id,
        WEAPON_TYPE.RED_DAGGER.id, WEAPON_TYPE.BLUE_DAGGER.id, WEAPON_TYPE.GREEN_DAGGER.id,
        WEAPON_TYPE.RED_TOME.id, WEAPON_TYPE.BLUE_TOME.id, WEAPON_TYPE.GREEN_TOME.id
      ]
    }
  },
  CLOSE_COUNTER: {
    name: "Close Counter",
    description: "Unit can counterattack regardless of foe's range.",
    img: "assets/skills/Close_Counter.webp",
    type: SKILL_TYPE.A,
    effects: [EFFECT.distantCloseCounter()],
    canUse: {
      weaponType: RANGED
    }
  },
  DISTANT_COUNTER: {
    name: "Distant Counter",
    description: "Unit can counterattack regardless of foe's range.",
    img: "assets/skills/Distant_Counter.webp",
    type: SKILL_TYPE.A,
    effects: [EFFECT.distantCloseCounter()],
    canUse: {
      weaponType: MELEE
    }
  },
  CLOSE_DEF_3: {
    name: "Close Def 3",
    description: "If foe initiates combat and uses sword, lance, axe, dragonstone, or beast damage, grants Def/Res+6 during combat.",
    img: "assets/skills/Close_Def_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.FOE_INITIATES_COMBAT },
          { type: EFFECT_CONDITION.FOE_HAS_X_RANGE, range: 1 }
        ),
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ]
  },
  DISTANT_DEF_3: {
    name: "Distant Def 3",
    description: "If foe initiates combat and uses bow, dagger, magic, or staff, grants Def/Res+6 during combat.",
    img: "assets/skills/Distant_Def_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.FOE_INITIATES_COMBAT },
          { type: EFFECT_CONDITION.FOE_HAS_X_RANGE, range: 2 }
        ),
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ]
  },
  SVALINN_SHIELD: {
    name: "Svalinn Shield",
    description: "Neutralizes \"effective against armoured\" bonuses.",
    img: "assets/skills/Svalinn_Shield.webp",
    type: SKILL_TYPE.A,
    effects: [EFFECT.neutralizeEffectiveAgainstMoveType(MOVE_TYPE.ARMOURED.id)],
    canUse: {
      moveType: [MOVE_TYPE.ARMOURED.id]
    }
  },
  GRANIS_SHIELD: {
    name: "Grani's Shield",
    description: "Neutralizes \"effective against cavalry\" bonuses.",
    img: "assets/skills/Granis_Shield.webp",
    type: SKILL_TYPE.A,
    effects: [EFFECT.neutralizeEffectiveAgainstMoveType(MOVE_TYPE.CAVALRY.id)],
    canUse: {
      moveType: [MOVE_TYPE.CAVALRY.id]
    }
  },
  IOTES_SHIELD: {
    name: "Iote's Shield",
    description: "Neutralizes \"effective against flying\" bonuses.",
    img: "assets/skills/Iotes_Shield.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [EFFECT.neutralizeEffectiveAgainstMoveType(MOVE_TYPE.FLIER.id)],
    canUse: {
      moveType: [MOVE_TYPE.FLIER.id]
    }
  },
  HEAVY_BLADE_3: {
    name: "Heavy Blade 3",
    description: "If unit's Atk > foe's Atk, grants Special cooldown charge +1 per unit's attack. (Only highest value applied. Does not stack.)",
    img: "assets/skills/Heavy_Blade_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.DURING_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE, unitStat: STATS.ATK, foeStat: STATS.ATK, statType: STAT_CHECK_TYPE.IN_COMBAT },
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.SPECIAL_CHARGES_PER_UNIT_ATTACK, target: { type: EFFECT_TARGET.SELF } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  FLASHING_BLADE_3: {
    name: "Flashing Blade 3",
    description: "If unit's Spd > foe's Spd, grants Special cooldown charge +1 per unit's attack. (Only highest value applied. Does not stack.)",
    img: "assets/skills/Flashing_Blade_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.DURING_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE, unitStat: STATS.SPD, foeStat: STATS.SPD, statType: STAT_CHECK_TYPE.IN_COMBAT },
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.SPECIAL_CHARGES_PER_UNIT_ATTACK, target: { type: EFFECT_TARGET.SELF } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES,
      moveType: [MOVE_TYPE.INFANTRY.id, MOVE_TYPE.ARMOURED.id]
    }
  },
  FIRE_BOOST_3: {
    name: "Fire Boost 3",
    description: "At start of combat, if unit's HP ≥ foe's HP+3, grants Atk+6 during combat.",
    img: "assets/skills/Fire_Boost_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: {
          type: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_EQUAL_TO_FOE,
          unitStat: STATS.HP,
          foeStat: STATS.HP,
          statType: STAT_CHECK_TYPE.VISIBLE,
          foeModifier: 3
        },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  WIND_BOOST_3: {
    name: "Wind Boost 3",
    description: "At start of combat, if unit's HP ≥ foe's HP+3, grants Spd+6 during combat.",
    img: "assets/skills/Wind_Boost_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: {
          type: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_EQUAL_TO_FOE,
          unitStat: STATS.HP,
          foeStat: STATS.HP,
          statType: STAT_CHECK_TYPE.VISIBLE,
          foeModifier: 3
        },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  EARTH_BOOST_3: {
    name: "Earth Boost 3",
    description: "At start of combat, if unit's HP ≥ foe's HP+3, grants Def+6 during combat.",
    img: "assets/skills/Earth_Boost_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: {
          type: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_EQUAL_TO_FOE,
          unitStat: STATS.HP,
          foeStat: STATS.HP,
          statType: STAT_CHECK_TYPE.VISIBLE,
          foeModifier: 3
        },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  WATER_BOOST_3: {
    name: "Water Boost 3",
    description: "At start of combat, if unit's HP ≥ foe's HP+3, grants Res+6 during combat.",
    img: "assets/skills/Water_Boost_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: {
          type: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_EQUAL_TO_FOE,
          unitStat: STATS.HP,
          foeStat: STATS.HP,
          statType: STAT_CHECK_TYPE.VISIBLE,
          foeModifier: 3
        },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  ATK_SPD_BOND_3: {
    name: "Atk/Spd Bond 3",
    description: "If unit is adjacent to an ally, grants Atk/Spd+5 during combat.",
    img: "assets/skills/Atk_Spd_Bond_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_IS_ADJACENT_TO_ALLY },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 5, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 5, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ]
  },
  ATK_DEF_BOND_3: {
    name: "Atk/Def Bond 3",
    description: "If unit is adjacent to an ally, grants Atk/Def+5 during combat.",
    img: "assets/skills/Atk_Def_Bond_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_IS_ADJACENT_TO_ALLY },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 5, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 5, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ]
  },
  ATK_RES_BOND_3: {
    name: "Atk/Res Bond 3",
    description: "If unit is adjacent to an ally, grants Atk/Res+5 during combat.",
    img: "assets/skills/Atk_Res_Bond_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_IS_ADJACENT_TO_ALLY },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 5, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 5, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ]
  },
  SPD_DEF_BOND_3: {
    name: "Spd/Def Bond 3",
    description: "If unit is adjacent to an ally, grants Spd/Def+5 during combat.",
    img: "assets/skills/Spd_Def_Bond_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_IS_ADJACENT_TO_ALLY },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 5, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 5, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ]
  },
  SPD_RES_BOND_3: {
    name: "Spd/Res Bond 3",
    description: "If unit is adjacent to an ally, grants Spd/Res+5 during combat.",
    img: "assets/skills/Spd_Res_Bond_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_IS_ADJACENT_TO_ALLY },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 5, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 5, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ]
  },
  DEF_RES_BOND_3: {
    name: "Def/Res Bond 3",
    description: "If unit is adjacent to an ally, grants Def/Res+5 during combat.",
    img: "assets/skills/Def_Res_Bond_3.webp",
    type: SKILL_TYPE.A,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_IS_ADJACENT_TO_ALLY },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 5, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 5, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ]
  },
};

const B_SKILLS = {
  WARY_FIGHTER: {
    name: "Wary Fighter 3",
    description: "If unit's HP ≥ 50%, unit and foe cannot make a follow-up attack.",
    img: "assets/skills/Wary_Fighter_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 50 },
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.ARMOURED.id]
    }
  },
  SWORDBREAKER_3: {
    name: "Swordbreaker 3",
    description: "If unit's HP ≥ 50% in combat against a sword foe, unit makes a guaranteed follow-up attack and foe cannot make a follow-up attack.",
    img: "assets/skills/Swordbreaker_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 50 },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.SWORD.id }
        ),
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE } }
        ]
      }
    ],
    canUse: {
      weaponType: [
        WEAPON_TYPE.SWORD.id, WEAPON_TYPE.LANCE.id,
        WEAPON_TYPE.RED_BOW, WEAPON_TYPE.BLUE_BOW, WEAPON_TYPE.C_BOW.id,
        WEAPON_TYPE.RED_DAGGER, WEAPON_TYPE.BLUE_DAGGER, WEAPON_TYPE.C_DAGGER.id,
        WEAPON_TYPE.RED_TOME, WEAPON_TYPE.BLUE_TOME, WEAPON_TYPE.C_TOME.id,
        WEAPON_TYPE.RED_BREATH, WEAPON_TYPE.BLUE_BREATH, WEAPON_TYPE.C_BREATH.id,
        WEAPON_TYPE.RED_BEAST, WEAPON_TYPE.BLUE_BEAST, WEAPON_TYPE.C_BEAST.id
      ]
    }
  },
  LANCEBREAKER_3: {
    name: "Lancebreaker 3",
    description: "If unit's HP ≥ 50% in combat against a lance foe, unit makes a guaranteed follow-up attack and foe cannot make a follow-up attack.",
    img: "assets/skills/Lancebreaker_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 50 },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.LANCE.id }
        ),
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE } }
        ]
      }
    ],
    canUse: {
      weaponType: [
        WEAPON_TYPE.AXE.id, WEAPON_TYPE.LANCE.id,
        WEAPON_TYPE.GREEN_BOW, WEAPON_TYPE.BLUE_BOW, WEAPON_TYPE.C_BOW.id,
        WEAPON_TYPE.GREEN_DAGGER, WEAPON_TYPE.BLUE_DAGGER, WEAPON_TYPE.C_DAGGER.id,
        WEAPON_TYPE.GREEN_TOME, WEAPON_TYPE.BLUE_TOME, WEAPON_TYPE.C_TOME.id,
        WEAPON_TYPE.GREEN_BREATH, WEAPON_TYPE.BLUE_BREATH, WEAPON_TYPE.C_BREATH.id,
        WEAPON_TYPE.GREEN_BEAST, WEAPON_TYPE.BLUE_BEAST, WEAPON_TYPE.C_BEAST.id
      ]
    }
  },
  AXEBREAKER_3: {
    name: "Axebreaker 3",
    description: "If unit's HP ≥ 50% in combat against a axe foe, unit makes a guaranteed follow-up attack and foe cannot make a follow-up attack.",
    img: "assets/skills/Axebreaker_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 50 },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.AXE.id }
        ),
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE } }
        ]
      }
    ],
    canUse: {
      weaponType: [
        WEAPON_TYPE.SWORD.id, WEAPON_TYPE.AXE.id,
        WEAPON_TYPE.RED_BOW, WEAPON_TYPE.GREEN_BOW, WEAPON_TYPE.C_BOW.id,
        WEAPON_TYPE.RED_DAGGER, WEAPON_TYPE.GREEN_DAGGER, WEAPON_TYPE.C_DAGGER.id,
        WEAPON_TYPE.RED_TOME, WEAPON_TYPE.GREEN_TOME, WEAPON_TYPE.C_TOME.id,
        WEAPON_TYPE.RED_BREATH, WEAPON_TYPE.GREEN_BREATH, WEAPON_TYPE.C_BREATH.id,
        WEAPON_TYPE.RED_BEAST, WEAPON_TYPE.GREEN_BEAST, WEAPON_TYPE.C_BEAST.id
      ]
    }
  },
  BOWBREAKER_3: {
    name: "Bowbreaker 3",
    description: "If unit's HP ≥ 50% in combat against an axe foe, unit makes a guaranteed follow-up attack and foe cannot make a follow-up attack.",
    img: "assets/skills/Bowbreaker_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 50 },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.C_BOW.id }
        ),
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.INFANTRY.id, MOVE_TYPE.ARMOURED.id, MOVE_TYPE.CAVALRY.id],
    }
  },
  DAGGERBREAKER_3: {
    name: "Daggerbreaker 3",
    description: "If unit's HP ≥ 50% in combat against a colourless dagger foe, unit makes a guaranteed follow-up attack and foe cannot make a follow-up attack.",
    img: "assets/skills/Daggerbreaker_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 50 },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.C_DAGGER.id }
        ),
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE } }
        ]
      }
    ]
  },
  R_TOMEBREAKER_3: {
    name: "R Tomebreaker 3",
    description: "If unit's HP ≥ 50% in combat against a red tome foe, unit makes a guaranteed follow-up attack and foe cannot make a follow-up attack.",
    img: "assets/skills/R_Tomebreaker_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 50 },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.RED_TOME.id }
        ),
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE } }
        ]
      }
    ],
    canUse: {
      weaponType: [
        WEAPON_TYPE.SWORD.id, WEAPON_TYPE.LANCE.id,
        WEAPON_TYPE.RED_BOW, WEAPON_TYPE.BLUE_BOW, WEAPON_TYPE.C_BOW.id,
        WEAPON_TYPE.RED_DAGGER, WEAPON_TYPE.BLUE_DAGGER, WEAPON_TYPE.C_DAGGER.id,
        WEAPON_TYPE.RED_TOME, WEAPON_TYPE.BLUE_TOME, WEAPON_TYPE.C_TOME.id,
        WEAPON_TYPE.RED_BREATH, WEAPON_TYPE.BLUE_BREATH, WEAPON_TYPE.C_BREATH.id,
        WEAPON_TYPE.RED_BEAST, WEAPON_TYPE.BLUE_BEAST, WEAPON_TYPE.C_BEAST.id
      ]
    }
  },
  B_TOMEBREAKER_3: {
    name: "B Tomebreaker 3",
    description: "If unit's HP ≥ 50% in combat against a blue tome foe, unit makes a guaranteed follow-up attack and foe cannot make a follow-up attack.",
    img: "assets/skills/B_Tomebreaker_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 50 },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.BLUE_TOME.id }
        ),
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE } }
        ]
      }
    ],
    canUse: {
      weaponType: [
        WEAPON_TYPE.AXE.id, WEAPON_TYPE.LANCE.id,
        WEAPON_TYPE.GREEN_BOW, WEAPON_TYPE.BLUE_BOW, WEAPON_TYPE.C_BOW.id,
        WEAPON_TYPE.GREEN_DAGGER, WEAPON_TYPE.BLUE_DAGGER, WEAPON_TYPE.C_DAGGER.id,
        WEAPON_TYPE.GREEN_TOME, WEAPON_TYPE.BLUE_TOME, WEAPON_TYPE.C_TOME.id,
        WEAPON_TYPE.GREEN_BREATH, WEAPON_TYPE.BLUE_BREATH, WEAPON_TYPE.C_BREATH.id,
        WEAPON_TYPE.GREEN_BEAST, WEAPON_TYPE.BLUE_BEAST, WEAPON_TYPE.C_BEAST.id
      ]
    }
  },
  G_TOMEBREAKER_3: {
    name: "G Tomebreaker 3",
    description: "If unit's HP ≥ 50% in combat against a green tome foe, unit makes a guaranteed follow-up attack and foe cannot make a follow-up attack.",
    img: "assets/skills/G_Tomebreaker_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 50 },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.GREEN_TOME.id }
        ),
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } },
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.FOE } }
        ]
      }
    ],
    canUse: {
      weaponType: [
        WEAPON_TYPE.SWORD.id, WEAPON_TYPE.AXE.id,
        WEAPON_TYPE.RED_BOW, WEAPON_TYPE.GREEN_BOW, WEAPON_TYPE.C_BOW.id,
        WEAPON_TYPE.RED_DAGGER, WEAPON_TYPE.GREEN_DAGGER, WEAPON_TYPE.C_DAGGER.id,
        WEAPON_TYPE.RED_TOME, WEAPON_TYPE.GREEN_TOME, WEAPON_TYPE.C_TOME.id,
        WEAPON_TYPE.RED_BREATH, WEAPON_TYPE.GREEN_BREATH, WEAPON_TYPE.C_BREATH.id,
        WEAPON_TYPE.RED_BEAST, WEAPON_TYPE.GREEN_BEAST, WEAPON_TYPE.C_BEAST.id
      ]
    }
  },
  WINDSWEEP_3: {
    name: "Windsweep 3",
    description: "If unit initiates combat, unit cannot make a follow-up attack. If unit’s Spd > foe’s Spd and foe uses sword, lance, axe, bow, dagger, or beast damage, foe cannot counterattack.",
    img: "assets/skills/Windsweep_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } }]
      },
      {
        phase: EFFECT_PHASE.DURING_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE, unitStat: STATS.SPD, foeStat: STATS.SPD, statType: STAT_CHECK_TYPE.IN_COMBAT },
          CONDITION.or(
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.SWORD.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.LANCE.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.AXE.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.RED_BOW.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.BLUE_BOW.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.GREEN_BOW.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.C_BOW.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.RED_DAGGER.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.BLUE_DAGGER.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.GREEN_DAGGER.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.C_DAGGER.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.RED_BEAST.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.BLUE_BEAST.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.GREEN_BEAST.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.C_BEAST.id }
          )
        ),
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_COUNTERATTACK, target: { type: EFFECT_TARGET.FOE } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  WATERSWEEP_3: {
    name: "Watersweep 3",
    description: "If unit initiates combat, unit cannot make a follow-up attack. If unit's Spd > foe's Spd and foe uses magic, staff, or dragonstone, foe cannot counterattack.",
    img: "assets/skills/Watersweep_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } }]
      },
      {
        phase: EFFECT_PHASE.DURING_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE, unitStat: STATS.SPD, foeStat: STATS.SPD, statType: STAT_CHECK_TYPE.IN_COMBAT },
          CONDITION.or(
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.RED_TOME.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.BLUE_TOME.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.GREEN_TOME.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.C_TOME.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.STAFF.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.RED_BREATH.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.BLUE_BREATH.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.GREEN_BREATH.id },
            { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.C_BREATH.id }
          )
        ),
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANT_COUNTERATTACK, target: { type: EFFECT_TARGET.FOE } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  WRATHFUL_STAFF: {
    name: "Wrathful Staff 3",
    description: "Calculates damage from staff like other weapons.",
    img: "assets/skills/Wrathful_Staff_3.webp",
    type: SKILL_TYPE.B,
    effects: [EFFECT.wrathful()],
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  },
  DAZZLING_STAFF: {
    name: "Dazzling Staff 3",
    description: "Foe cannot counterattack.",
    img: "assets/skills/Dazzling_Staff_3.webp",
    type: SKILL_TYPE.B,
    effects: [EFFECT.foeCantCounterattack()],
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  },
  BRASH_ASSAULT_3: {
    name: "Brash Assault 3",
    description: "If unit initiates combat against a foe that can counter and unit's HP ≤ 50%, unit makes a guaranteed follow-up attack.",
    img: "assets/skills/Brash_Assault_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.DURING_COMBAT_2,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
          { type: EFFECT_CONDITION.FOE_CAN_COUNTER },
          { type: EFFECT_CONDITION.UNIT_HP_LESS_THAN_EQUAL_TO, percent: 50 }
        ),
        actions: [
          { type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } }
        ]
      }
    ]
  },
  FLIER_FORMATION_3: {
    name: "Flier Formation 3",
    description: "Unit can move to a space adjacent to a flying ally within 2 spaces.",
    img: "assets/skills/Flier_Formation_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.CALCULATE_OWN_MOVEMENT,
        actions: [{
          type: EFFECT_ACTION.ENABLE_WARP,
          target: {
            type: EFFECT_TARGET.SPACES_WITHIN_ALLIES,
            moveType: MOVE_TYPE.FLIER.id,
            allyRange: 2,
            warpRange: 1
          }
        }]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.FLIER.id]
    }
  },
  BLAZE_DANCE_3: {
    name: "Blaze Dance 3",
    description: "If Sing or Dance is used, grants Atk+4 to target.",
    img: "assets/skills/Blaze_Dance_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.USED_DANCE,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 4, target: { type: EFFECT_TARGET.ASSIST_TARGET } }]
      }
    ]
  },
  GALE_DANCE_3: {
    name: "Gale Dance 3",
    description: "If Sing or Dance is used, grants Spd+4 to target.",
    img: "assets/skills/Gale_Dance_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.USED_DANCE,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 4, target: { type: EFFECT_TARGET.ASSIST_TARGET } }]
      }
    ]
  },
  EARTH_DANCE_3: {
    name: "Earth Dance 3",
    description: "If Sing or Dance is used, grants Def+5 to target.",
    img: "assets/skills/Earth_Dance_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.USED_DANCE,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 5, target: { type: EFFECT_TARGET.ASSIST_TARGET } }]
      }
    ]
  },
  TORRENT_DANCE_3: {
    name: "Torrent Dance 3",
    description: "If Sing or Dance is used, grants Res+5 to target.",
    img: "assets/skills/Torrent_Dance_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.USED_DANCE,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 5, target: { type: EFFECT_TARGET.ASSIST_TARGET } }]
      }
    ]
  },
  CALDERA_DANCE_2: {
    name: "Caldera Dance 2",
    description: "If Sing or Dance is used, grants Atk+3 and Def+4 to target.",
    img: "assets/skills/Caldera_Dance_2.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.USED_DANCE,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 3, target: { type: EFFECT_TARGET.ASSIST_TARGET } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.ASSIST_TARGET } }
        ]
      }
    ]
  },
  FIREFLOOD_DANCE_2: {
    name: "Fireflood Dance 2",
    description: "If Sing or Dance is used, grants Atk+3 and Res+4 to target.",
    img: "assets/skills/Fireflood_Dance_2.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.USED_DANCE,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 3, target: { type: EFFECT_TARGET.ASSIST_TARGET } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.ASSIST_TARGET } }
        ]
      }
    ]
  },
  FIRESTORM_DANCE_2: {
    name: "Firestorm Dance 2",
    description: "If Sing or Dance is used, grants Atk+3 and Spd+3 to target.",
    img: "assets/skills/Firestorm_Dance_2.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.USED_DANCE,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 3, target: { type: EFFECT_TARGET.ASSIST_TARGET } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 3, target: { type: EFFECT_TARGET.ASSIST_TARGET } }
        ]
      }
    ]
  },
  ROCKSLIDE_DANCE_2: {
    name: "Rockslide Dance 2",
    description: "If Sing or Dance is used, grants Spd+3 and Def+4 to target.",
    img: "assets/skills/Rockslide_Dance_2.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.USED_DANCE,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 3, target: { type: EFFECT_TARGET.ASSIST_TARGET } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.ASSIST_TARGET } }
        ]
      }
    ]
  },
  DELUGE_DANCE_2: {
    name: "Deluge Dance 2",
    description: "If Sing or Dance is used, grants Spd+3 and Res+4 to target.",
    img: "assets/skills/Deluge_Dance_2.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.USED_DANCE,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 3, target: { type: EFFECT_TARGET.ASSIST_TARGET } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.ASSIST_TARGET } }
        ]
      }
    ]
  },
  GEYSER_DANCE_2: {
    name: "Geyser Dance 2",
    description: "If Sing or Dance is used, grants Def/Res+4 to target.",
    img: "assets/skills/Geyser_Dance_2.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.USED_DANCE,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.ASSIST_TARGET } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.ASSIST_TARGET } }
        ]
      }
    ]
  },
  KNOCK_BACK: {
    name: "Knock Back",
    description: "If unit initiates combat, target foe moves 1 space away after combat.",
    img: "assets/skills/Knock_Back.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT_DISPLACEMENT,
        condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
        actions: [{ type: EFFECT_ACTION.POST_COMBAT_MOVEMENT, movementType: MOVEMENT_TYPE.SHOVE, target: { type: EFFECT_TARGET.FOE_POST_COMBAT } }]
      }
    ],
    canUse: {
      weaponType: MELEE
    }
  },
  LUNGE: {
    name: "Lunge",
    description: "If unit initiates combat, unit and target foe swap spaces after combat.",
    img: "assets/skills/Lunge.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT_DISPLACEMENT,
        condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
        actions: [{ type: EFFECT_ACTION.POST_COMBAT_MOVEMENT, movementType: MOVEMENT_TYPE.SWAP, target: { type: EFFECT_TARGET.FOE_POST_COMBAT } }]
      }
    ],
    canUse: {
      weaponType: MELEE
    }
  },
  DRAG_BACK: {
    name: "Drag Back",
    description: "If unit initiates combat, unit moves 1 space away after combat. Target foe moves to unit's previous space.",
    img: "assets/skills/Drag_Back.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT_DISPLACEMENT,
        condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
        actions: [{ type: EFFECT_ACTION.POST_COMBAT_MOVEMENT, movementType: MOVEMENT_TYPE.DRAW_BACK, target: { type: EFFECT_TARGET.FOE_POST_COMBAT } }]
      }
    ],
    canUse: {
      weaponType: MELEE
    }
  },
  HIT_AND_RUN: {
    name: "Hit and Run",
    description: "If unit initiates combat, unit moves 1 space away after combat.",
    img: "assets/skills/Hit_and_Run.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT_DISPLACEMENT,
        condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
        actions: [{ type: EFFECT_ACTION.POST_COMBAT_MOVEMENT, movementType: MOVEMENT_TYPE.HIT_AND_RUN, target: { type: EFFECT_TARGET.FOE_POST_COMBAT } }]
      }
    ],
    canUse: {
      weaponType: MELEE
    }
  },
  PASS_3: {
    name: "Pass 3",
    description: "If unit's HP ≥ 25%, unit can move through foes' spaces.",
    img: "assets/skills/Pass_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.CALCULATE_OWN_MOVEMENT,
        condition: { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 25 },
        actions: [{ type: EFFECT_ACTION.SET_MOVEMENT_FLAG, flag: MOVEMENT_FLAG.PASS }]
      }
    ]
  },
  OBSTRUCT_3: {
    name: "Obstruct 3",
    description: "If unit's HP ≥ 50%, foes cannot move through spaces adjacent to unit. (Does not affect foes with Pass skills.)",
    img: "assets/skills/Obstruct_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.CALCULATE_ENEMY_MOVEMENT,
        condition: { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 50 },
        actions: [{ type: EFFECT_ACTION.OBSTRUCT_TILES, spaces: 1 }]
      }
    ]
  },
  DULL_RANGED_3: {
    name: "Dull Ranged 3",
    description: "If foe uses bow, dagger, magic, or staff, neutralizes foe's bonuses (from skills like Fortify, Rally, etc.) during combat.",
    img: "assets/skills/Dull_Ranged_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.FOE_HAS_X_RANGE, range: 2 },
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_BONUSES, target: { type: EFFECT_TARGET.FOE } }]
      }
    ]
  },
  DULL_CLOSE_3: {
    name: "Dull Close 3",
    description: "If foe uses sword, lance, axe, dragonstone, or beast damage, neutralizes foe's bonuses (from skills like Fortify, Rally, etc.) during combat.",
    img: "assets/skills/Dull_Close_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.FOE_HAS_X_RANGE, range: 1 },
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.NEUTRALIZE_BONUSES, target: { type: EFFECT_TARGET.FOE } }]
      }
    ],
    canUse: {
      weaponType: MELEE
    }
  },
  WINGS_OF_MERCY_3: {
    name: "Wings of Mercy 3",
    description: "If an ally's HP ≤ 50%, unit can move to a space adjacent to that ally.",
    img: "assets/skills/Wings_of_Mercy_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.CALCULATE_OWN_MOVEMENT,
        actions: [{ type: EFFECT_ACTION.ENABLE_WARP, target: { type: EFFECT_TARGET.SPACES_WITHIN_ALLIES, warpRange: 1, hpThreshold: 50 } }]
      }
    ]
  },
  ESCAPE_ROUTE_3: {
    name: "Escape Route 3",
    description: "If unit’s HP ≤ 50%, unit can move to a space adjacent to any ally.",
    img: "assets/skills/Escape_Route_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.CALCULATE_OWN_MOVEMENT,
        condition: { type: EFFECT_CONDITION.UNIT_HP_LESS_THAN_EQUAL_TO, percent: 50 },
        actions: [{ type: EFFECT_ACTION.ENABLE_WARP, target: { type: EFFECT_TARGET.SPACES_WITHIN_ALLIES, warpRange: 1 } }]
      }
    ]
  },
  DESPERATION_3: {
    name: "Desperation 3",
    description: "If unit’s HP ≤ 75% and unit initiates combat, unit can make a follow-up attack before foe can counterattack.",
    img: "assets/skills/Desperation_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_HP_LESS_THAN_EQUAL_TO, percent: 75 },
          { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT }
        ),
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.DESPERATION, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  VANTAGE_3: {
    name: "Vantage 3",
    description: "If unit's HP ≤ 75% and foe initiates combat, unit can counterattack before foe's first attack.",
    img: "assets/skills/Vantage_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_HP_LESS_THAN_EQUAL_TO, percent: 75 },
          { type: EFFECT_CONDITION.FOE_INITIATES_COMBAT }
        ),
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.VANTAGE, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  GUARD_3: {
    name: "Guard 3",
    description: "At start of combat, if unit's HP ≥ 80%, inflicts Special cooldown charge -1 on foe per attack. (Only highest value applied. Does not stack.)",
    img: "assets/skills/Guard_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 80 },
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARD, target: { type: EFFECT_TARGET.FOE } }]
      }
    ]
  },
  QUICK_RIPOSTE_3: {
    name: "Quick Riposte 3",
    description: "If unit's HP ≥ 70% and foe initiates combat, unit makes a guaranteed follow-up attack.",
    img: "assets/skills/Quick_Riposte_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO, percent: 70 },
          { type: EFFECT_CONDITION.FOE_INITIATES_COMBAT }
        ),
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.GUARANTEED_FOLLOW_UP, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  LIVE_TO_SERVE_3: {
    name: "Live to Serve 3",
    description: "When healing an ally with a staff, restores HP to unit = HP restored to target.",
    img: "assets/skills/Live_to_Serve_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.USED_HEAL,
        actions: [{ type: EFFECT_ACTION.RESTORE_HP, calculation: { type: EFFECT_CALCULATION.HP_RESTORED_TO_TARGET }, target: { type: EFFECT_TARGET.SELF } }]
      }
    ],
    canUse: {
      weaponType: [WEAPON_TYPE.STAFF.id]
    }
  },
  POISON_STRIKE_3: {
    name: "Poison Strike 3",
    description: "If unit initiates combat, deals 10 damage to foe after combat.",
    img: "assets/skills/Poison_Strike_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, value: 10, target: { type: EFFECT_TARGET.FOE_POST_COMBAT } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SEAL_ATK_3: {
    name: "Seal Atk 3",
    description: "Inflicts Atk-7 on foe through its next action after combat.",
    img: "assets/skills/Seal_Atk_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.ATK, value: 7, target: { type: EFFECT_TARGET.FOE_POST_COMBAT } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SEAL_SPD_3: {
    name: "Seal Spd 3",
    description: "Inflicts Spd-7 on foe through its next action after combat.",
    img: "assets/skills/Seal_Spd_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.SPD, value: 7, target: { type: EFFECT_TARGET.FOE_POST_COMBAT } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SEAL_DEF_3: {
    name: "Seal Def 3",
    description: "Inflicts Def-7 on foe through its next action after combat.",
    img: "assets/skills/Seal_Def_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.DEF, value: 7, target: { type: EFFECT_TARGET.FOE_POST_COMBAT } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SEAL_RES_3: {
    name: "Seal Res 3",
    description: "Inflicts Res-7 on foe through its next action after combat.",
    img: "assets/skills/Seal_Res_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.RES, value: 7, target: { type: EFFECT_TARGET.FOE_POST_COMBAT } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SHIELD_PULSE_3: {
    name: "Shield Pulse 3",
    description: "At the start of turn 1, if foe's attack can trigger unit's Special, grants Special cooldown count-2. Reduces damage dealt to unit by 5 when Special triggers.",
    img: "assets/skills/Shield_Pulse_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: CONDITION.and(
          { type: EFFECT_CONDITION.IS_TURN_COUNT, turnCount: 1 },
          { type: EFFECT_CONDITION.FOES_ATTACK_CAN_TRIGGER_UNITS_SPECIAL }
        ),
        actions: [{ type: EFFECT_ACTION.CURRENT_SPECIAL_COOLDOWN_MOD, value: -2, target: { type: EFFECT_TARGET.SELF } }]
      },
      {
        phase: EFFECT_PHASE.ON_DEFENSIVE_SPECIAL_TRIGGER,
        actions: [{ type: EFFECT_ACTION.DAMAGE_REDUCTION, flat: 5 }]
      }
    ],
    canUse: {
      weaponType: MELEE,
      moveType: [MOVE_TYPE.INFANTRY.id, MOVE_TYPE.ARMOURED.id]
    }
  },
  RENEWAL_3: {
    name: "Renewal 3",
    description: "At start of odd-numbered turns, restores 10 HP.",
    img: "assets/skills/Renewal_3.webp",
    type: SKILL_TYPE.B,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: { type: EFFECT_CONDITION.IS_ODD_TURN },
        actions: [{ type: EFFECT_ACTION.RESTORE_HP, value: 10, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  WRATH_3: {
    name: "Wrath 3",
    description: "At start of turn, if unit's HP ≤ 75% and unit's attack can trigger their Special, grants Special cooldown count-1, and deals +10 damage when Special triggers.",
    img: "assets/skills/Wrath_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: { type: EFFECT_CONDITION.UNIT_HP_LESS_THAN_EQUAL_TO, percent: 75 },
        actions: [{ type: EFFECT_ACTION.CURRENT_SPECIAL_COOLDOWN_MOD, value: -1, target: { type: EFFECT_TARGET.SELF } }]
      },
      {
        phase: EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER,
        condition: { type: EFFECT_CONDITION.UNIT_HP_LESS_THAN_EQUAL_TO, percent: 75 },
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, value: 10 }]
      }
    ],
    canUse: {
      weaponType: MELEE,
      moveType: [MOVE_TYPE.INFANTRY.id, MOVE_TYPE.ARMOURED.id]
    }
  },
  CANCEL_AFFINITY_3: {
    name: "Cancel Affinity 3",
    description: "Neutralizes weapon-triangle advantage granted by unit's skills. If unit has weapon-triangle disadvantage, reverses weapon-triangle advantage granted by foe's skills.",
    img: "assets/skills/Cancel_Affinity_3.webp",
    type: SKILL_TYPE.B,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CANCEL_AFFINITY, target: { type: EFFECT_TARGET.SELF } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
};

const C_SKILLS = {
  SPUR_ATK_3: {
    name: "Spur Atk 3",
    description: "Grants Atk+4 to adjacent allies during combat.",
    img: "assets/skills/Spur_Atk_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 1 },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }]
      }
    ]
  },
  SPUR_SPD_3: {
    name: "Spur Spd 3",
    description: "Grants Spd+4 to adjacent allies during combat.",
    img: "assets/skills/Spur_Spd_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 1 },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }]
      }
    ]
  },
  SPUR_DEF_3: {
    name: "Spur Def 3",
    description: "Grants Def+4 to adjacent allies during combat.",
    img: "assets/skills/Spur_Def_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 1 },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }]
      }
    ]
  },
  SPUR_RES_3: {
    name: "Spur Res 3",
    description: "Grants Res+4 to adjacent allies during combat.",
    img: "assets/skills/Spur_Res_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 1 },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }]
      }
    ]
  },
  SPUR_ATK_SPD_2: {
    name: "Spur Atk/Spd 2",
    description: "Grants Atk/Spd+3 to adjacent allies during combat.",
    img: "assets/skills/Spur_Atk_Spd_2.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 1 },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ]
  },
  SPUR_ATK_DEF_2: {
    name: "Spur Atk/Def 2",
    description: "Grants Atk/Def+3 to adjacent allies during combat.",
    img: "assets/skills/Spur_Atk_Def_2.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 1 },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ]
  },
  SPUR_ATK_RES_2: {
    name: "Spur Atk/Res 2",
    description: "Grants Atk/Res+3 to adjacent allies during combat.",
    img: "assets/skills/Spur_Atk_Res_2.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 1 },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ]
  },
  SPUR_SPD_DEF_2: {
    name: "Spur Spd/Def 2",
    description: "Grants Spd/Def+3 to adjacent allies during combat.",
    img: "assets/skills/Spur_Spd_Def_2.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 1 },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ]
  },
  SPUR_SPD_RES_2: {
    name: "Spur Spd/Res 2",
    description: "Grants Spd/Res+3 to adjacent allies during combat.",
    img: "assets/skills/Spur_Spd_Res_2.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 1 },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ]
  },
  SPUR_DEF_RES_2: {
    name: "Spur Def/Res 2",
    description: "Grants Def/Res+3 to adjacent allies during combat.",
    img: "assets/skills/Spur_Def_Res_2.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 1 },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ]
  },
  DRIVE_ATK_2: {
    name: "Drive Atk 2",
    description: "Grants Atk+3 to allies within 2 spaces during combat.",
    img: "assets/skills/Drive_Atk_2.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2 },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }]
      }
    ]
  },
  DRIVE_SPD_2: {
    name: "Drive Spd 2",
    description: "Grants Spd+3 to allies within 2 spaces during combat.",
    img: "assets/skills/Drive_Spd_2.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2 },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }]
      }
    ]
  },
  DRIVE_DEF_2: {
    name: "Drive Def 2",
    description: "Grants Def+3 to allies within 2 spaces during combat.",
    img: "assets/skills/Drive_Def_2.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2 },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }]
      }
    ]
  },
  DRIVE_RES_2: {
    name: "Drive Res 2",
    description: "Grants Res+3 to allies within 2 spaces during combat.",
    img: "assets/skills/Drive_Res_2.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2 },
        actions: [{ type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 3, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }]
      }
    ]
  },
  GOAD_ARMOUR: {
    name: "Goad Armour",
    description: "Grants Atk/Spd+4 to armoured allies within 2 spaces during combat.",
    img: "assets/skills/Goad_Armour.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, moveType: MOVE_TYPE.ARMOURED.id },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.ARMOURED.id]
    }
  },
  WARD_ARMOUR: {
    name: "Ward Armour",
    description: "Grants Def/Res+4 to armoured allies within 2 spaces during combat.",
    img: "assets/skills/Ward_Armour.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, moveType: MOVE_TYPE.ARMOURED.id },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.ARMOURED.id]
    }
  },
  GOAD_CAVALRY: {
    name: "Goad Cavalry",
    description: "Grants Atk/Spd+4 to cavalry allies within 2 spaces during combat.",
    img: "assets/skills/Goad_Cavalry.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, moveType: MOVE_TYPE.CAVALRY.id },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.CAVALRY.id]
    }
  },
  WARD_CAVALRY: {
    name: "Ward Cavalry",
    description: "Grants Def/Res+4 to cavalry allies within 2 spaces during combat.",
    img: "assets/skills/Ward_Cavalry.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, moveType: MOVE_TYPE.CAVALRY.id },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.CAVALRY.id]
    }
  },
  GOAD_FLIERS: {
    name: "Goad Fliers",
    description: "Grants Atk/Spd+4 to flying allies within 2 spaces during combat.",
    img: "assets/skills/Goad_Fliers.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, moveType: MOVE_TYPE.FLIER.id },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.FLIER.id]
    }
  },
  WARD_FLIERS: {
    name: "Ward Fliers",
    description: "Grants Def/Res+4 to flying allies within 2 spaces during combat.",
    img: "assets/skills/Ward_Fliers.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, moveType: MOVE_TYPE.FLIER.id },
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.FLIER.id]
    }
  },
  GOAD_DRAGONS: {
    name: "Goad Dragons",
    description: "Grants Atk/Spd+4 to dragon allies within 2 spaces during combat.",
    img: "assets/skills/Goad_Dragons.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: CONDITION.or(
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.RED_BREATH.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.BLUE_BREATH.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.GREEN_BREATH.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.C_BREATH.id }
        ),
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ],
    canUse: {
      weaponType: DRAGONS
    }
  },
  WARD_DRAGONS: {
    name: "Ward Dragons",
    description: "Grants Def/Res+4 to dragon allies within 2 spaces during combat.",
    img: "assets/skills/Ward_Dragons.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: CONDITION.or(
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.RED_BREATH.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.BLUE_BREATH.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.GREEN_BREATH.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.C_BREATH.id }
        ),
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ],
    canUse: {
      weaponType: DRAGONS
    }
  },
  GOAD_BEASTS: {
    name: "Goad Beasts",
    description: "Grants Atk/Spd+4 to beast allies within 2 spaces during combat.",
    img: "assets/skills/Goad_Beasts.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: CONDITION.or(
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.RED_BEAST.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.BLUE_BEAST.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.GREEN_BEAST.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.C_BEAST.id }
        ),
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.ATK, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.SPD, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ],
    canUse: {
      weaponType: BEASTS
    }
  },
  WARD_BEASTS: {
    name: "Ward Beasts",
    description: "Grants Def/Res+4 to beast allies within 2 spaces during combat.",
    img: "assets/skills/Ward_Beasts.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_ALLY_COMBAT,
        condition: CONDITION.or(
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.RED_BEAST.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.BLUE_BEAST.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.GREEN_BEAST.id },
          { type: EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT, spaces: 2, weaponType: WEAPON_TYPE.C_BEAST.id }
        ),
        actions: [
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } },
          { type: EFFECT_ACTION.COMBAT_STAT_MOD, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.ALLY_IN_COMBAT } }
        ]
      }
    ],
    canUse: {
      weaponType: BEASTS
    }
  },
  SAVAGE_BLOW_3: {
    name: "Savage Blow 3",
    description: "If unit initiates combat, deals 7 damage to foes within 2 spaces of target after combat.",
    img: "assets/skills/Savage_Blow_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
        actions: [{ type: EFFECT_ACTION.DEAL_DAMAGE, value: 7, target: { type: EFFECT_TARGET.FOES_WITHIN_X_SPACES_OF_FOE, spaces: 2 } }]
      }
    ]
  },
  BREATH_OF_LIFE_3: {
    name: "Breath of Life 3",
    description: "If unit initiates combat, restores 7 HP to adjacent allies after combat.",
    img: "assets/skills/Breath_of_Life_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT,
        condition: { type: EFFECT_CONDITION.UNIT_INITIATES_COMBAT },
        actions: [{ type: EFFECT_ACTION.RESTORE_HP, value: 7, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1 } }]
      }
    ]
  },
  HONE_ATK_3: {
    name: "Hone Atk 3",
    description: "At start of turn, grants Atk+4 to adjacent allies for 1 turn.",
    img: "assets/skills/Hone_Atk_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 4, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1 } }]
      }
    ]
  },
  HONE_SPD_3: {
    name: "Hone Spd 3",
    description: "At start of turn, grants Spd+4 to adjacent allies for 1 turn.",
    img: "assets/skills/Hone_Spd_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 4, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1 } }]
      }
    ]
  },
  FORTIFY_DEF_3: {
    name: "Fortify Def 3",
    description: "At start of turn, grants Def+4 to adjacent allies for 1 turn.",
    img: "assets/skills/Fortify_Def_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 4, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1 } }]
      }
    ]
  },
  FORTIFY_RES_3: {
    name: "Fortify Res 3",
    description: "At start of turn, grants Res+4 to adjacent allies for 1 turn.",
    img: "assets/skills/Fortify_Res_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [{ type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 4, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1 } }]
      }
    ]
  },
  HONE_ARMOUR: {
    name: "Hone Armour",
    description: "At start of turn, grants Atk/Spd+6 to adjacent armoured allies for 1 turn.",
    img: "assets/skills/Hone_Armour.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.ARMOURED.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.ARMOURED.id } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.ARMOURED.id]
    }
  },
  FORTIFY_ARMOUR: {
    name: "Fortify Armour",
    description: "At start of turn, grants Def/Res+6 to adjacent armoured allies for 1 turn.",
    img: "assets/skills/Fortify_Armour.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.ARMOURED.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.ARMOURED.id } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.ARMOURED.id]
    }
  },
  HONE_CAVALRY: {
    name: "Hone Cavalry",
    description: "At start of turn, grants Atk/Spd+6 to adjacent cavalry allies for 1 turn.",
    img: "assets/skills/Hone_Cavalry.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.CAVALRY.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.CAVALRY.id } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.CAVALRY.id]
    }
  },
  FORTIFY_CAVALRY: {
    name: "Fortify Cavalry",
    description: "At start of turn, grants Def/Res+6 to adjacent cavalry allies for 1 turn.",
    img: "assets/skills/Fortify_Cavalry.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.CAVALRY.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.CAVALRY.id } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.CAVALRY.id]
    }
  },
  HONE_FLIERS: {
    name: "Hone Fliers",
    description: "At start of turn, grants Atk/Spd+6 to adjacent flying allies for 1 turn.",
    img: "assets/skills/Hone_Fliers.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.FLIER.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.FLIER.id } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.FLIER.id]
    }
  },
  FORTIFY_FLIERS: {
    name: "Fortify Fliers",
    description: "At start of turn, grants Def/Res+6 to adjacent flying allies for 1 turn.",
    img: "assets/skills/Fortify_Fliers.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.FLIER.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, moveType: MOVE_TYPE.FLIER.id } }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.FLIER.id]
    }
  },
  HONE_DRAGONS: {
    name: "Hone Dragons",
    description: "At start of turn, grants Atk/Spd+6 to adjacent dragon allies for 1 turn.",
    img: "assets/skills/Hone_Dragons.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.RED_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.RED_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.BLUE_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.BLUE_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.GREEN_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.GREEN_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.C_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.C_BREATH.id } }
        ]
      }
    ],
    canUse: {
      weaponType: DRAGONS
    }
  },
  FORTIFY_DRAGONS: {
    name: "Fortify Dragons",
    description: "At start of turn, grants Def/Res+6 to adjacent dragon allies for 1 turn.",
    img: "assets/skills/Fortify_Dragons.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.RED_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.RED_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.BLUE_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.BLUE_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.GREEN_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.GREEN_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.C_BREATH.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.C_BREATH.id } }
        ]
      }
    ],
    canUse: {
      weaponType: DRAGONS
    }
  },
  HONE_BEASTS: {
    name: "Hone Beasts",
    description: "At start of turn, grants Atk/Spd+6 to adjacent beast allies for 1 turn.",
    img: "assets/skills/Hone_Beasts.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.RED_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.RED_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.BLUE_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.BLUE_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.GREEN_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.GREEN_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.ATK, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.C_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.SPD, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.C_BEAST.id } }
        ]
      }
    ],
    canUse: {
      weaponType: DRAGONS
    }
  },
  FORTIFY_BEASTS: {
    name: "Fortify Beasts",
    description: "At start of turn, grants Def/Res+6 to adjacent beast allies for 1 turn.",
    img: "assets/skills/Fortify_Beasts.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.RED_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.RED_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.BLUE_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.BLUE_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.GREEN_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.GREEN_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.DEF, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.C_BEAST.id } },
          { type: EFFECT_ACTION.APPLY_BUFF, stat: STATS.RES, value: 6, target: { type: EFFECT_TARGET.ALLIES_WITHIN_X_SPACES, spaces: 1, weaponType: WEAPON_TYPE.C_BEAST.id } }
        ]
      }
    ],
    canUse: {
      weaponType: DRAGONS
    }
  },
  THREATEN_ATK_3: {
    name: "Threaten Atk 3",
    description: "At start of turn, inflicts Atk-5 on foes within 2 spaces through their next actions.",
    img: "assets/skills/Threaten_Atk_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.ATK, value: 5, target: { type: EFFECT_TARGET.FOES_WITHIN_X_SPACES, spaces: 2 } }]
      }
    ]
  },
  THREATEN_SPD_3: {
    name: "Threaten Spd 3",
    description: "At start of turn, inflicts Spd-5 on foes within 2 spaces through their next actions.",
    img: "assets/skills/Threaten_Spd_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.SPD, value: 5, target: { type: EFFECT_TARGET.FOES_WITHIN_X_SPACES, spaces: 2 } }]
      }
    ]
  },
  THREATEN_DEF_3: {
    name: "Threaten Def 3",
    description: "At start of turn, inflicts Def-5 on foes within 2 spaces through their next actions.",
    img: "assets/skills/Threaten_Def_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.DEF, value: 5, target: { type: EFFECT_TARGET.FOES_WITHIN_X_SPACES, spaces: 2 } }]
      }
    ]
  },
  THREATEN_RES_3: {
    name: "Threaten Res 3",
    description: "At start of turn, inflicts Res-5 on foes within 2 spaces through their next actions.",
    img: "assets/skills/Threaten_Res_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.RES, value: 5, target: { type: EFFECT_TARGET.FOES_WITHIN_X_SPACES, spaces: 2 } }]
      }
    ]
  },
  GUIDANCE_3: {
    name: "Guidance 3",
    description: "Infantry and armoured allies within 2 spaces can move to a space adjacent to unit.",
    img: "assets/skills/Guidance_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.CALCULATE_ALLY_MOVEMENT,
        condition: CONDITION.or(
          { type: EFFECT_CONDITION.MOVING_ALLY_WITHIN_X_SPACES_OF_UNIT, spaces: 2, moveType: MOVE_TYPE.INFANTRY.id },
          { type: EFFECT_CONDITION.MOVING_ALLY_WITHIN_X_SPACES_OF_UNIT, spaces: 2, moveType: MOVE_TYPE.ARMOURED.id }
        ),
        actions: [{ type: EFFECT_ACTION.ENABLE_WARP, target: { type: EFFECT_TARGET.SPACES_WITHIN_UNIT, spaces: 1 } }]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.FLIER.id]
    }
  },
  ATK_PLOY_3: {
    name: "Atk Ploy 3",
    description: "At start of turn, inflicts Atk-5 on foes in cardinal directions with Res < unit's Res through their next actions.",
    img: "assets/skills/Atk_Ploy_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          {
            type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.ATK, value: 5,
            target: {
              type: EFFECT_TARGET.FOES_IN_CARDINAL_DIRECTIONS,
              with: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE,
              unitStat: STATS.RES,
              foeStat: STATS.RES
            }
          }
        ]
      }
    ]
  },
  SPD_PLOY_3: {
    name: "Spd Ploy 3",
    description: "At start of turn, inflicts Spd-5 on foes in cardinal directions with Res < unit's Res through their next actions.",
    img: "assets/skills/Spd_Ploy_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          {
            type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.SPD, value: 5,
            target: {
              type: EFFECT_TARGET.FOES_IN_CARDINAL_DIRECTIONS,
              with: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE,
              unitStat: STATS.RES,
              foeStat: STATS.RES
            }
          }
        ]
      }
    ]
  },
  DEF_PLOY_3: {
    name: "Def Ploy 3",
    description: "At start of turn, inflicts Def-5 on foes in cardinal directions with Res < unit's Res through their next actions.",
    img: "assets/skills/Def_Ploy_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          {
            type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.DEF, value: 5,
            target: {
              type: EFFECT_TARGET.FOES_IN_CARDINAL_DIRECTIONS,
              with: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE,
              unitStat: STATS.RES,
              foeStat: STATS.RES
            }
          }
        ]
      }
    ]
  },
  RES_PLOY_3: {
    name: "Res Ploy 3",
    description: "At start of turn, inflicts Res-5 on foes in cardinal directions with Res < unit's Res through their next actions.",
    img: "assets/skills/Res_Ploy_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          {
            type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.RES, value: 5,
            target: {
              type: EFFECT_TARGET.FOES_IN_CARDINAL_DIRECTIONS,
              with: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE,
              unitStat: STATS.RES,
              foeStat: STATS.RES
            }
          }
        ]
      }
    ]
  },
  PANIC_PLOY_3: {
    name: "Panic Ploy 3",
    description: "At start of turn, converts bonuses on foes in cardinal directions with HP < unit's HP into penalties through their next actions.",
    img: "assets/skills/Panic_Ploy_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        actions: [
          {
            type: EFFECT_ACTION.APPLY_STATUS, status: STATUS.PANIC.id,
            target: {
              type: EFFECT_TARGET.FOES_IN_CARDINAL_DIRECTIONS,
              with: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE,
              unitStat: STATS.HP,
              foeStat: STATS.HP
            }
          }
        ]
      }
    ]
  },
  ATK_SMOKE_3: {
    name: "Atk Smoke 3",
    description: "Inflicts Atk-7 on foes within 2 spaces of target through their next actions after combat.",
    img: "assets/skills/Atk_Smoke_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.ATK, value: 7, target: { type: EFFECT_TARGET.FOES_WITHIN_X_SPACES_OF_FOE, spaces: 2 } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  SPD_SMOKE_3: {
    name: "Spd Smoke 3",
    description: "Inflicts Spd-7 on foes within 2 spaces of target through their next actions after combat.",
    img: "assets/skills/Spd_Smoke_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.SPD, value: 7, target: { type: EFFECT_TARGET.FOES_WITHIN_X_SPACES_OF_FOE, spaces: 2 } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  DEF_SMOKE_3: {
    name: "Def Smoke 3",
    description: "Inflicts Def-7 on foes within 2 spaces of target through their next actions after combat.",
    img: "assets/skills/Def_Smoke_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.DEF, value: 7, target: { type: EFFECT_TARGET.FOES_WITHIN_X_SPACES_OF_FOE, spaces: 2 } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  RES_SMOKE_3: {
    name: "Res Smoke 3",
    description: "Inflicts Res-7 on foes within 2 spaces of target through their next actions after combat.",
    img: "assets/skills/Res_Smoke_3.webp",
    type: SKILL_TYPE.C,
    availableAsSeal: true,
    effects: [
      {
        phase: EFFECT_PHASE.AFTER_COMBAT,
        actions: [{ type: EFFECT_ACTION.APPLY_DEBUFF, stat: STATS.RES, value: 7, target: { type: EFFECT_TARGET.FOES_WITHIN_X_SPACES_OF_FOE, spaces: 2 } }]
      }
    ],
    canUse: {
      weaponType: NON_STAVES
    }
  },
  INFANTRY_PULSE_3: {
    name: "Infantry Pulse 3",
    description: "At the start of turn 1, grants Special cooldown count-1 to all infantry allies on team with HP < unit’s HP. (Stacks with similar skills.)",
    img: "assets/skills/Infantry_Pulse_3.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: { type: EFFECT_CONDITION.IS_TURN_COUNT, turnCount: 1 },
        actions: [
          {
            type: EFFECT_ACTION.CURRENT_SPECIAL_COOLDOWN_MOD, value: -1,
            target: {
              type: EFFECT_TARGET.ALL_ALLIES,
              moveType: MOVE_TYPE.INFANTRY.id,
              with: EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_ALLY,
              unitStat: STATS.HP,
              foeStat: STATS.HP
            }
          }
        ]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.INFANTRY.id]
    }
  },
  ARMOUR_MARCH: {
    name: "Armoured March",
    description: "At start of turn, if unit is adjacent to an armored ally, unit and adjacent armored allies can move 1 extra space. (That turn only. Does not stack.)",
    img: "assets/skills/Armour_March_3.webp",
    type: SKILL_TYPE.C,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: { type: EFFECT_CONDITION.UNIT_IS_ADJACENT_TO_ALLY, moveType: MOVE_TYPE.ARMOURED.id },
        actions: [{ type: EFFECT_ACTION.APPLY_STATUS, status: STATUS.MOBILITY_INCREASED.id, target: { type: EFFECT_TARGET.UNIT_AND_ALLIES_WITHIN_X_SPACES, moveType: MOVE_TYPE.ARMOURED.id, spaces: 1 } }]
      },
    ],
    canUse: {
      moveType: [MOVE_TYPE.ARMOURED.id]
    }
  },
};

const S_SKILLS = {
  ARMOURED_BOOTS: {
    name: "Armoured Boots",
    description: "At start of turn, if unit's HP = 100%, unit can move 1 extra space. (That turn only. Does not stack.)",
    img: "assets/skills/Armoured_Boots.webp",
    type: SKILL_TYPE.S,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: { type: EFFECT_CONDITION.UNIT_HP_IS_MAX_HP },
        actions: [{ type: EFFECT_ACTION.APPLY_STATUS, status: STATUS.MOBILITY_INCREASED.id, target: { type: EFFECT_TARGET.SELF } }]
      }
    ],
    canUse: {
      moveType: [MOVE_TYPE.ARMOURED.id]
    }
  },
  QUICKENED_PULSE: {
    name: "Quickened Pulse",
    description: "At the start of turn 1, grants Special cooldown count-1.",
    img: "assets/skills/Quickened_Pulse.webp",
    type: SKILL_TYPE.S,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_TURN,
        condition: { type: EFFECT_CONDITION.IS_TURN_COUNT, turnCount: 1 },
        actions: [{ type: EFFECT_ACTION.CURRENT_SPECIAL_COOLDOWN_MOD, value: -1, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  HARDY_BEARING_3: {
    name: "Hardy Bearing 3",
    description: "Disables unit's and foe's skills that change attack priority.",
    img: "assets/skills/Hardy_Bearing_3.webp",
    type: SKILL_TYPE.S,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.HARDY_BEARING, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  PHANTOM_SPD_3: {
    name: "Phantom Spd 3",
    description: "If a skill compares unit's Spd to a foe's or ally's Spd, treats unit's Spd as if granted +10.",
    img: "assets/skills/Phantom_Spd_3.webp",
    type: SKILL_TYPE.S,
    effects: [EFFECT.phantom(STATS.SPD, 10)]
  },
  PHANTOM_RES_3: {
    name: "Phantom Res 3",
    description: "If a skill compares unit's Res to a foe's or ally's Res, treats unit's Res as if granted +10.",
    img: "assets/skills/Phantom_Res_3.webp",
    type: SKILL_TYPE.S,
    effects: [EFFECT.phantom(STATS.RES, 10)]
  },
  DEFLECT_MELEE_3: {
    name: "Deflect Melee 3",
    description: "If unit receives consecutive attacks and foe uses a sword, lance, or axe, reduces damage from foe's second attack onward by 80%.",
    img: "assets/skills/Deflect_Melee_3.webp",
    type: SKILL_TYPE.S,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.or(
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.SWORD.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.LANCE.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.AXE.id }
        ),
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CONSECUTIVE_ATTACK_DAMAGE_REDUCTION, percent: 80, target: { type: EFFECT_TARGET.SELF } }]
      }
    ],
    canUse: {
      weaponType: MELEE
    }
  },
  DEFLECT_MISSILE_3: {
    name: "Deflect Missile 3",
    description: "If unit receives consecutive attacks and foe uses bow or dagger, reduces damage from foe's second attack onward by 80%.",
    img: "assets/skills/Deflect_Missile_3.webp",
    type: SKILL_TYPE.S,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.or(
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.RED_BOW.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.BLUE_BOW.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.GREEN_BOW.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.C_BOW.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.RED_DAGGER.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.BLUE_DAGGER.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.GREEN_DAGGER.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.C_DAGGER.id }
        ),
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CONSECUTIVE_ATTACK_DAMAGE_REDUCTION, percent: 80, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
  DEFLECT_MAGIC_3: {
    name: "Deflect Magic 3",
    description: "If unit receives consecutive attacks and foe uses magic, reduces damage from foe's second attack onward by 80%.",
    img: "assets/skills/Deflect_Magic_3.webp",
    type: SKILL_TYPE.S,
    effects: [
      {
        phase: EFFECT_PHASE.START_OF_COMBAT,
        condition: CONDITION.or(
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.RED_TOME.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.BLUE_TOME.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.GREEN_TOME.id },
          { type: EFFECT_CONDITION.FOE_IS_WEAPON_TYPE, weaponType: WEAPON_TYPE.C_TOME.id }
        ),
        actions: [{ type: EFFECT_ACTION.SET_COMBAT_FLAG, flag: COMBAT_FLAG.CONSECUTIVE_ATTACK_DAMAGE_REDUCTION, percent: 80, target: { type: EFFECT_TARGET.SELF } }]
      }
    ]
  },
};

const SKILLS = { ...CAPTAIN_SKILLS, ...WEAPON_SKILLS, ...ASSIST_SKILLS, ...SPECIAL_SKILLS, ...A_SKILLS, ...B_SKILLS, ...C_SKILLS, ...S_SKILLS }

// console.log(`${Object.keys(ASSIST_SKILLS).length} assist skills
// ${Object.keys(SPECIAL_SKILLS).length} special skills
// ${Object.keys(A_SKILLS).length} a skills
// ${Object.keys(B_SKILLS).length} b skills
// ${Object.keys(C_SKILLS).length} c skills
// ${Object.keys(S_SKILLS).length} s skills`);

Object.entries(SKILLS).forEach(([key, value]) => {
  SKILLS[key] = { id: key, ...value };
  if (value.availableAsSeal) {
    const sealId = key + "_SEAL";
    const seal = { ...value };
    seal.id = sealId;
    seal.type = SKILL_TYPE.S;
    SKILLS[sealId] = seal;
  }
});

export default SKILLS;
