import UNIT from "./data/units.js";
import SKILLS from "./data/skills.js";
import MAPS from "./data/maps.js";

function createBuild(unitId, skills = []) {
  return {
    unitId,
    level: 40,
    merges: 0,
    skills
  }
}

const cavs = [
  createBuild(UNIT.CECILIA.id, [SKILLS.TURMOIL.id, SKILLS.TOME_OF_ORDER.id + "_REFINE_EFF", SKILLS.DRAW_BACK.id, SKILLS.GLIMMER.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.GUARD_3.id, SKILLS.GOAD_CAVALRY.id, SKILLS.DRIVE_ATK_2.id + "_SEAL"]),
  createBuild(UNIT.ELIWOOD.id, [SKILLS.BLAZING_DURANDAL.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.GALEFORCE.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.DRAG_BACK.id, SKILLS.WARD_CAVALRY.id, SKILLS.SWIFT_SPARROW_2.id + "_SEAL"]),
  createBuild(UNIT.ABEL.id, [SKILLS.PANTHER_LANCE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.MOONBOW.id, SKILLS.DEATH_BLOW_3.id, SKILLS.DRAG_BACK.id, SKILLS.WARD_CAVALRY.id, SKILLS.DEATH_BLOW_3.id + "_SEAL"]),
  createBuild(UNIT.ELISE.id, [SKILLS.ELISES_STAFF.id + "_REFINE_EFF", SKILLS.PHYSIC_PLUS.id, SKILLS.MIRACLE.id, SKILLS.ATK_SPD_BOND_3.id, SKILLS.DAZZLING_STAFF.id, SKILLS.SAVAGE_BLOW_3.id, SKILLS.ATK_SPD_BOND_3.id + "_SEAL"]),
  createBuild(UNIT.JAGEN.id, [SKILLS.VETERAN_LANCE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.ICEBERG.id, SKILLS.FURY_3.id, SKILLS.DRAG_BACK.id, SKILLS.GOAD_CAVALRY.id, SKILLS.DRIVE_SPD_2.id + "_SEAL"])
];
const fliers = [
  createBuild(UNIT.CATRIA.id, [SKILLS.EARTH_RENDERING.id, SKILLS.WHITEWING_LANCE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.MOONBOW.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.HARDY_BEARING_3.id]),
  createBuild(UNIT.OLIVIA.id, [SKILLS.SLAYING_EDGE_PLUS.id + "_REFINE_DEF", SKILLS.DANCE.id, SKILLS.MOONBOW.id, SKILLS.FURY_3.id, SKILLS.WINGS_OF_MERCY_3.id, SKILLS.DRIVE_SPD_2.id, SKILLS.DRIVE_SPD_2.id + "_SEAL"]),
  createBuild(UNIT.EST.id, [SKILLS.WHITEWING_SPEAR.id + "_REFINE_EFF", SKILLS.DRAW_BACK.id, SKILLS.LUNA.id, SKILLS.ATK_DEF_BOND_3.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.ATK_DEF_BOND_3.id + "_SEAL"]),
  createBuild(UNIT.CAMILLA.id, [SKILLS.CAMILLAS_AXE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.LUNA.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.SWIFT_SPARROW_2.id + "_SEAL"]),
  createBuild(UNIT.PALLA.id, [SKILLS.WHITEWING_BLADE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.LUNA.id, SKILLS.FURY_3.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.ATK_SPD_BOND_3.id + "_SEAL"])
];

const armours = [
  createBuild(UNIT.AZAMA.id, [SKILLS.EARTH_RENDERING.id, SKILLS.PAIN_PLUS.id + "_REFINE_WRATHFUL", SKILLS.MARTYR_PLUS.id, SKILLS.MIRACLE.id, SKILLS.FORTRESS_DEF_3.id, SKILLS.DAZZLING_STAFF.id, SKILLS.SAVAGE_BLOW_3.id, SKILLS.SAVAGE_BLOW_3.id + "_SEAL"]),
  createBuild(UNIT.VIRION.id, [SKILLS.DIGNIFIED_BOW.id + "_REFINE_EFF", SKILLS.DRAW_BACK.id, SKILLS.GLIMMER.id, SKILLS.HP_ATK_2.id, SKILLS.GUARD_3.id, SKILLS.DRIVE_RES_2.id, SKILLS.HP_ATK_2.id + "_SEAL"]),
  createBuild(UNIT.GWENDOLYN.id, [SKILLS.WEIGHTED_LANCE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.BONFIRE.id, SKILLS.DISTANT_COUNTER.id, SKILLS.QUICK_RIPOSTE_3.id, SKILLS.WARD_ARMOUR.id, SKILLS.STEADY_BREATH.id + "_SEAL"]),
  createBuild(UNIT.DRAUG.id, [SKILLS.STALWART_SWORD.id + "_REFINE_EFF", SKILLS.SMITE.id, SKILLS.MOONBOW.id, SKILLS.ATK_SPD_BOND_3.id, SKILLS.WINGS_OF_MERCY_3.id, SKILLS.ARMOUR_MARCH.id, SKILLS.ATK_SPD_BOND_3.id + "_SEAL"]),
  createBuild(UNIT.EFFIE.id, [SKILLS.EFFIES_LANCE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.MOONBOW.id, SKILLS.DISTANT_COUNTER.id, SKILLS.VANTAGE_3.id, SKILLS.WARD_ARMOUR.id, SKILLS.DEATH_BLOW_3.id + "_SEAL"])
];

export const SD_ASSAULT_LEVELS = [
  {
    id: "1",
    name: "Sky Attack",
    description: "Engage in a battle for air superiority",
    battles: [
      { map: MAPS.SD8, enemyTeam: fliers, side: "red" }
    ]
  },
  {
    id: "2",
    name: "Iron Wall",
    description: "Break through the phalanx.",
    battles: [
      { map: MAPS.SD7, enemyTeam: armours, side: "red" }
    ]
  },
  {
    id: "3",
    name: "Cavalry Training",
    description: "Endure their relentless advance.",
    battles: [
      { map: MAPS.SD9, enemyTeam: cavs, side: "blue" }
    ]
  },
  {
    id: "4",
    name: "Trial of Emblems",
    description: "Face of against the triple threat.",
    battles: [
      { map: MAPS.SD8, enemyTeam: fliers, side: "red" },
      { map: MAPS.SD7, enemyTeam: armours, side: "red" },
      { map: MAPS.SD9, enemyTeam: cavs, side: "blue" },
    ]
  },
];
