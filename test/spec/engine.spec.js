import { STATS, TERRAIN } from "../../js/data/definitions.js";
import MAPS from "../../js/data/maps.js";
import SKILLS from "../../js/data/skills.js";
import STATUS from "../../js/data/status.js";
import UNIT from "../../js/data/units.js";
import Engine from "../../js/engine.js";

function createBuild(unitId, skills = []) {
  return {
    unitId,
    level: 40,
    merges: 0,
    skills
  }
}

describe("Engine", function () {
  let engine;
  let map;
  let team1;
  let team2;
  beforeEach(function () {
    engine = Engine();
    map = {
      name: "test map", terrain: [[TERRAIN.PLAINS, TERRAIN.PLAINS]], defensiveTerrain: [], blocks: [], startingPositions: [[{ x: 0, y: 0 }], [{ x: 1, y: 0 }]]
    }
    team1 = [createBuild(UNIT.ALFONSE.id)];
    team2 = [createBuild(UNIT.BARTRE.id)];
  });

  describe("Build Validation", function () {
    it("should not allow more than one weapon", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id, SKILLS.BRAVE_SWORD_PLUS.id]);
      expect(engine.validateBuild(build).result).toBeFalse();
    });

    it("should not allow weapon of different type", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_LANCE_PLUS.id]);
      expect(engine.validateBuild(build).result).toBeFalse();
    });

    it("should not allow duplicate skills", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.HIT_AND_RUN.id, SKILLS.QUICK_RIPOSTE_3.id]);
      expect(engine.validateBuild(build).result).toBeFalse();
    });

    it("should allow exclusive skills", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.FOLKVANGR.id]);
      expect(engine.validateBuild(build).result).toBeTrue();
    });

    it("should not allow exclusive skills on wrong unit", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.WING_SWORD.id]);
      expect(engine.validateBuild(build).result).toBeFalse();
    });

    it("should allow correct weapon type", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.SWORDBREAKER_3.id]);
      expect(engine.validateBuild(build).result).toBeTrue();
    });

    it("should not allow incorrect weapon type", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.LANCEBREAKER_3.id]);
      expect(engine.validateBuild(build).result).toBeFalse();
    });

    it("should allow correct move type", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.INFANTRY_PULSE_3.id]);
      expect(engine.validateBuild(build).result).toBeTrue();
    });

    it("should not allow incorrect move type", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.GUIDANCE_3.id]);
      expect(engine.validateBuild(build).result).toBeFalse();
    });

    it("should check multiple conditions", function () {
      const build = createBuild(UNIT.CAEDA.id, [SKILLS.STEADY_BREATH.id]);
      expect(engine.validateBuild(build).result).toBeFalse();
    });

    it("should allow seal versions", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.QUICK_RIPOSTE_3.id, SKILLS.QUICK_RIPOSTE_3.id + "_SEAL"]);
      expect(engine.validateBuild(build).result).toBeTrue();
    });

    it("should have healer restrictions", function () {
      const build1 = createBuild(UNIT.AZAMA.id, [SKILLS.ABSORB_PLUS.id]);
      expect(engine.validateBuild(build1).result).toBeTrue();

      const build2 = createBuild(UNIT.AZAMA.id, [SKILLS.MOONBOW.id]);
      expect(engine.validateBuild(build2).result).toBeFalse();
    });

    it("should allow different seals on team", function () {
      const build1 = createBuild(UNIT.ALFONSE.id, [SKILLS.QUICK_RIPOSTE_3.id + "_SEAL"]);
      const build2 = createBuild(UNIT.ANNA.id, [SKILLS.GUARD_3.id + "_SEAL"]);
      expect(engine.validateTeam([build1, build2]).result).toBeTrue();
    });

    it("should not allow duplicate seals on team", function () {
      const build1 = createBuild(UNIT.ALFONSE.id, [SKILLS.QUICK_RIPOSTE_3.id + "_SEAL"]);
      const build2 = createBuild(UNIT.ANNA.id, [SKILLS.QUICK_RIPOSTE_3.id + "_SEAL"]);
      expect(engine.validateTeam([build1, build2]).result).toBeFalse();
    });
  });

  describe("Team Validation - Summoner Duels", function () {
    it("should require exactly 5 units", function () {
      const team = [
        createBuild(UNIT.ALFONSE.id, [SKILLS.FOLKVANGR.id]),
        createBuild(UNIT.BARTRE.id, [SKILLS.AXE_OF_VIRILITY.id]),
        createBuild(UNIT.ANNA.id, [SKILLS.NOATUN.id]),
        createBuild(UNIT.ABEL.id, [SKILLS.SILVER_LANCE_PLUS.id])
      ];
      expect(engine.validateTeam(team, "sd").result).toBeFalse();

      const validTeam = [
        createBuild(UNIT.ALFONSE.id, [SKILLS.FOLKVANGR.id]),
        createBuild(UNIT.BARTRE.id, [SKILLS.AXE_OF_VIRILITY.id]),
        createBuild(UNIT.ANNA.id, [SKILLS.NOATUN.id]),
        createBuild(UNIT.ABEL.id, [SKILLS.SILVER_LANCE_PLUS.id]),
        createBuild(UNIT.CAIN.id, [SKILLS.BRAVE_SWORD_PLUS.id])
      ];
      expect(engine.validateTeam(validTeam, "sd").result).toBeTrue();
    });

    it("should not allow duplicate heroes", function () {
      const team = [
        createBuild(UNIT.ALFONSE.id, [SKILLS.FOLKVANGR.id]),
        createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id]),
        createBuild(UNIT.BARTRE.id, [SKILLS.AXE_OF_VIRILITY.id]),
        createBuild(UNIT.ANNA.id, [SKILLS.NOATUN.id]),
        createBuild(UNIT.ABEL.id, [SKILLS.SILVER_LANCE_PLUS.id])
      ];
      expect(engine.validateTeam(team, "sd").result).toBeFalse();
    });

    it("should allow at most 1 refresher", function () {
      const team = [
        createBuild(UNIT.ALFONSE.id, [SKILLS.FOLKVANGR.id]),
        createBuild(UNIT.OLIVIA.id, [SKILLS.DANCE.id]),
        createBuild(UNIT.ANNA.id, [SKILLS.NOATUN.id]),
        createBuild(UNIT.ABEL.id, [SKILLS.SILVER_LANCE_PLUS.id]),
        createBuild(UNIT.CAIN.id, [SKILLS.BRAVE_SWORD_PLUS.id])
      ];
      expect(engine.validateTeam(team, "sd").result).toBeTrue();

      const invalidTeam = [
        createBuild(UNIT.OLIVIA.id, [SKILLS.DANCE.id]),
        createBuild(UNIT.AZURA.id, [SKILLS.SING.id]),
        createBuild(UNIT.ANNA.id, [SKILLS.NOATUN.id]),
        createBuild(UNIT.ABEL.id, [SKILLS.SILVER_LANCE_PLUS.id]),
        createBuild(UNIT.CAIN.id, [SKILLS.BRAVE_SWORD_PLUS.id])
      ];
      expect(engine.validateTeam(invalidTeam, "sd").result).toBeFalse();
    });
  });

  describe("Initialisation", function () {
    it("should use level 40 base stats", function () {
      const gameState = engine.newGame(map, team1, team2);
      expect(gameState.teams[0][0].stats.hp).toBe(UNIT.ALFONSE.level40Stats.hp);
      expect(gameState.teams[0][0].stats.atk).toBe(UNIT.ALFONSE.level40Stats.atk);
      expect(gameState.teams[0][0].stats.spd).toBe(UNIT.ALFONSE.level40Stats.spd);
      expect(gameState.teams[0][0].stats.def).toBe(UNIT.ALFONSE.level40Stats.def);
      expect(gameState.teams[0][0].stats.res).toBe(UNIT.ALFONSE.level40Stats.res);
      expect(gameState.teams[0][0].special.max).toBeNull();
      expect(gameState.teams[0][0].special.current).toBeNull();
    });

    it("should add boons and banes", function () {
      team1[0].boon = STATS.ATK;
      team1[0].bane = STATS.HP;
      const gameState = engine.newGame(map, team1, team2);
      expect(gameState.teams[0][0].stats.hp).toBe(UNIT.ALFONSE.level40Stats.hp - 3);
      expect(gameState.teams[0][0].stats.atk).toBe(UNIT.ALFONSE.level40Stats.atk + 3);
    });

    it("should add extra stat for superboons and superbanes", function () {
      team1[0].boon = STATS.SPD;
      team1[0].bane = STATS.DEF;
      const gameState = engine.newGame(map, team1, team2);
      expect(gameState.teams[0][0].stats.spd).toBe(UNIT.ALFONSE.level40Stats.spd + 4);
      expect(gameState.teams[0][0].stats.def).toBe(UNIT.ALFONSE.level40Stats.def - 4);
    });

    it("should remove bane on first merge", function () {
      team1[0].merges = 1;
      team1[0].boon = STATS.ATK;
      team1[0].bane = STATS.HP;
      const gameState = engine.newGame(map, team1, team2);
      expect(gameState.teams[0][0].stats.hp).toBe(UNIT.ALFONSE.level40Stats.hp + 1);
      expect(gameState.teams[0][0].stats.atk).toBe(UNIT.ALFONSE.level40Stats.atk + 4);
    });

    it("should add extra stat to top 3 stats on first merge when neutral", function () {
      team1[0].merges = 1;
      const gameState = engine.newGame(map, team1, team2);
      expect(gameState.teams[0][0].stats.hp).toBe(UNIT.ALFONSE.level40Stats.hp + 2);
      expect(gameState.teams[0][0].stats.atk).toBe(UNIT.ALFONSE.level40Stats.atk + 2);
      expect(gameState.teams[0][0].stats.def).toBe(UNIT.ALFONSE.level40Stats.def + 1);
    });

    it("should gain stats with a weapon equipped", function () {
      team1[0].skills.push(SKILLS.FOLKVANGR.id);
      const gameState = engine.newGame(map, team1, team2);
      expect(gameState.teams[0][0].stats.atk).toBe(UNIT.ALFONSE.level40Stats.atk + 16);
    });

    it("should gain extra stats with a refined weapon equipped", function () {
      team1[0].skills.push(SKILLS.FOLKVANGR.id + "_REFINE_DEF");
      const gameState = engine.newGame(map, team1, team2);
      expect(gameState.teams[0][0].stats.hp).toBe(UNIT.ALFONSE.level40Stats.hp + 5);
      expect(gameState.teams[0][0].stats.atk).toBe(UNIT.ALFONSE.level40Stats.atk + 16);
      expect(gameState.teams[0][0].stats.def).toBe(UNIT.ALFONSE.level40Stats.def + 4);
    });

    it("should have a special cooldown with special equipped", function () {
      team1[0].skills.push(SKILLS.AETHER.id);
      const gameState = engine.newGame(map, team1, team2);
      expect(gameState.teams[0][0].special.max).toBe(5);
      expect(gameState.teams[0][0].special.current).toBe(5);
    });

    it("should have reduced special cooldown with slaying weapon", function () {
      team1[0].skills.push(SKILLS.SLAYING_EDGE_PLUS.id, SKILLS.AETHER.id);
      const gameState = engine.newGame(map, team1, team2);
      expect(gameState.teams[0][0].special.max).toBe(4);
      expect(gameState.teams[0][0].special.current).toBe(4);
    });
  });

  describe("Start of Turn", function () {
    beforeEach(function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [
          [{ x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }],
          [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }]
        ]
      }
      team1 = [
        createBuild(UNIT.ALFONSE.id),
        createBuild(UNIT.BARTRE.id),
        createBuild(UNIT.CAEDA.id),
        createBuild(UNIT.DRAUG.id)
      ];
      team2 = [
        createBuild(UNIT.ELIWOOD.id),
        createBuild(UNIT.FAE.id),
        createBuild(UNIT.GWENDOLYN.id),
        createBuild(UNIT.HENRY.id)
      ];
    });

    it("should buff adjacent allies", function () {
      team1[1].skills.push(SKILLS.HONE_ATK_3.id);
      team2[0].skills.push(SKILLS.FORTIFY_DEF_3.id);
      const gameState = engine.newGame(map, team1, team2);
      engine.endSwapPhase(gameState);
      expect(gameState.teams[0][0].buffs.atk).toBe(4);
      expect(gameState.teams[0][1].buffs.atk).toBe(0);
      expect(gameState.teams[0][2].buffs.atk).toBe(4);
      expect(gameState.teams[0][3].buffs.atk).toBe(0);
      engine.endTurn(gameState);
      expect(gameState.teams[1][0].buffs.def).toBe(0);
      expect(gameState.teams[1][1].buffs.def).toBe(4);
      expect(gameState.teams[1][2].buffs.def).toBe(0);
      expect(gameState.teams[1][3].buffs.def).toBe(0);
    });

    it("should debuff foes with lower res", function () {
      team1[0].skills.push(SKILLS.ATK_PLOY_3.id);
      team2[0].skills.push(SKILLS.ATK_PLOY_3.id);
      const gameState = engine.newGame(map, team1, team2);
      engine.endSwapPhase(gameState);
      expect(gameState.teams[1][0].debuffs.atk).toBe(0);
      engine.endTurn(gameState);
      expect(gameState.teams[0][0].debuffs.atk).toBe(5);
    });

    it("should panic foes with lower hp", function () {
      team1[0].skills.push(SKILLS.PANIC_PLOY_3.id);
      team2[0].skills.push(SKILLS.PANIC_PLOY_3.id);
      const gameState = engine.newGame(map, team1, team2);
      engine.endSwapPhase(gameState);
      expect(gameState.teams[1][0].penalties).toContain(STATUS.PANIC.id);
      engine.endTurn(gameState);
      expect(gameState.teams[0][0].penalties).not.toContain(STATUS.PANIC.id);
    });

    it("should apply buffs before healing", function () {
      team1[0].skills.push(SKILLS.FOLKVANGR.id, SKILLS.RENEWAL_3.id);
      const gameState = engine.newGame(map, team1, team2);
      const alfonso = gameState.teams[0][0];
      alfonso.stats.hp = 20;
      engine.endSwapPhase(gameState);
      expect(alfonso.buffs.atk).toBe(5);
      expect(alfonso.stats.hp).toBe(30);
    });

    it("should pulse infantry allies with lower hp", function () {
      team1[0].skills.push(SKILLS.MOONBOW.id);
      team1[1].skills.push(SKILLS.INFANTRY_PULSE_3.id);
      team1[2].skills.push(SKILLS.MOONBOW.id);
      team1[3].skills.push(SKILLS.MOONBOW.id);
      const gameState = engine.newGame(map, team1, team2);
      expect(gameState.teams[0][0].special.current).toBe(2);
      expect(gameState.teams[0][2].special.current).toBe(2);
      expect(gameState.teams[0][3].special.current).toBe(2);
      gameState.teams[0][0].stats.hp = 1;
      engine.endSwapPhase(gameState);
      expect(gameState.teams[0][0].special.current).toBe(1);
      expect(gameState.teams[0][2].special.current).toBe(2);
      expect(gameState.teams[0][3].special.current).toBe(2);
    });
  });

  describe("Movement Range", function () {
    it("should not move through blocks", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [{ x: 1, y: 0, breakable: false }],
        startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
      }
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(1);
    });

    it("should move through blocks with 0 hp", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [{ x: 1, y: 0, breakable: true, hp: 0 }],
        startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
      }
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(3);
    });

    it("should move through allies", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
      }
      team1.push(createBuild(UNIT.ALFONSE.id));
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(3);
    });

    it("should not move through foes", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 0, y: 0 }], [{ x: 1, y: 0 }]]
      }
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(1);
    });

    it("should move through foes with Pass equipped", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 0, y: 0 }], [{ x: 1, y: 0 }]]
      }
      team1[0].skills.push(SKILLS.PASS_3.id);
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(2);
    });

    it("should land on obstructed spaces", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 0, y: 0 }], [{ x: 2, y: 1 }]]
      }
      team2[0].skills.push(SKILLS.OBSTRUCT_3.id);
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(5);
    });

    it("should not move through obstructed spaces", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]]
      }
      team2[0].skills.push(SKILLS.OBSTRUCT_3.id);
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(3);
    });

    it("should move through obstructed starting space", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 0, y: 0 }], [{ x: 1, y: 0 }]]
      }
      team2[0].skills.push(SKILLS.OBSTRUCT_3.id);
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(3);
    });

    it("should move through obstructed spaces with Pass equipped", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 0, y: 0 }], [{ x: 1, y: 0 }]]
      }
      team1[0].skills.push(SKILLS.PASS_3.id);
      team2[0].skills.push(SKILLS.OBSTRUCT_3.id);
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(4);
    });

    it("should warp next to ally with hp <= 50%", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.WALL, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.WALL, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 0, y: 0 }, { x: 2, y: 0 }], [{ x: 4, y: 1 }]]
      }
      team1.push(createBuild(UNIT.CAMILLA.id));
      team1[0].skills.push(SKILLS.WINGS_OF_MERCY_3.id);
      const gameState = engine.newGame(map, team1, team2);
      gameState.teams[0][1].stats.hp = 10;
      const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(3);
    });

    it("should move 1 space when affected by gravity", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 2, y: 2 }], [{ x: 0, y: 0 }]]
      }
      const gameState = engine.newGame(map, team1, team2);
      gameState.teams[0][0].penalties.push(STATUS.GRAVITY.id);
      const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(5);
    });

    describe("Infantry", function () {
      it("should move 2 spaces in all directions", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 2, y: 2 }], [{ x: 0, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(13);
      });

      it("should land on forest one space away, but not move through it", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.FOREST, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(2);
      });

      it("should land on forest two spaces away", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.FOREST, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(2);
      });

      it("should not land on flier terrain", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.FLIER, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(1);
      });

      it("should not land on walls", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.WALL, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(1);
      });

      it("should warp next to ally with Guidance", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.WALL, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.WALL, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }, { x: 2, y: 0 }], [{ x: 4, y: 1 }]]
        }
        team1.push(createBuild(UNIT.CAMILLA.id, [SKILLS.GUIDANCE_3.id]));
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(3);
      });
    });

    describe("Cavalry", function () {
      beforeEach(function () {
        team1 = [createBuild(UNIT.ABEL.id)];
      });

      it("should move 3 spaces in all directions", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 2, y: 2 }], [{ x: 0, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(21);
      });

      it("should not land on forest terrain", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.FOREST, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(1);
      });

      it("should should land on trench, but not move through it", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.TRENCH, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(2);
      });

      it("should not land on flier terrain", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.FLIER, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(1);
      });

      it("should not land on walls", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.WALL, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(1);
      });

      it("should not warp next to ally with Guidance", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.WALL, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.WALL, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }, { x: 2, y: 0 }], [{ x: 4, y: 1 }]]
        }
        team1.push(createBuild(UNIT.CAMILLA.id, [SKILLS.GUIDANCE_3.id]));
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(1);
      });
    });

    describe("Flier", function () {
      beforeEach(function () {
        team1 = [createBuild(UNIT.CAEDA.id)];
      });

      it("should move 2 spaces in all directions", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 2, y: 2 }], [{ x: 0, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(13);
      });

      it("should move through forest terrain", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.FOREST, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(3);
      });

      it("should move through flier terrain", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.FLIER, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(3);
      });

      it("should not move through walls", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.WALL, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(1);
      });
    });

    describe("Armoured", function () {
      beforeEach(function () {
        team1 = [createBuild(UNIT.DRAUG.id)];
      });

      it("should move 1 space in all directions", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 2, y: 2 }], [{ x: 0, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(5);
      });

      it("should move through forest terrain", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.FOREST, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        team1[0].skills.push(SKILLS.ARMOURED_BOOTS.id);
        const gameState = engine.newGame(map, team1, team2);
        engine.endSwapPhase(gameState);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(3);
      });

      it("should not stack extra movement", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.FOREST, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        team1[0].skills.push(SKILLS.ARMOURED_BOOTS.id, SKILLS.ARMOURED_BOOTS.id);
        const gameState = engine.newGame(map, team1, team2);
        engine.endSwapPhase(gameState);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(3);
      });

      it("should not land on flier terrain", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.FLIER, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(1);
      });

      it("should not land on walls", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.WALL, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 4, y: 0 }]]
        }
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateMovementRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(1);
      });
    });
  });

  describe("Threat Range", function () {
    it("should not have threat range when no weapon", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 2, y: 2 }], [{ x: 0, y: 0 }]]
      }
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateThreatRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(0);
    });

    it("should not threaten walls", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.WALL, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 2, y: 2 }], [{ x: 0, y: 0 }]]
      }
      team1[0].skills.push(SKILLS.SILVER_SWORD_PLUS.id);
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateThreatRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(20);
    });

    it("should not threaten unbreakable blocks", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [{ x: 2, y: 0, breakable: false }],
        startingPositions: [[{ x: 2, y: 2 }], [{ x: 0, y: 0 }]]
      }
      team1[0].skills.push(SKILLS.SILVER_SWORD_PLUS.id);
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateThreatRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(20);
    });

    it("should threaten broken blocks", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [{ x: 2, y: 0, breakable: true, hp: 0 }],
        startingPositions: [[{ x: 2, y: 2 }], [{ x: 0, y: 0 }]]
      }
      team1[0].skills.push(SKILLS.SILVER_SWORD_PLUS.id);
      const gameState = engine.newGame(map, team1, team2);
      const range = engine.calculateThreatRange(gameState, gameState.teams[0][0]);
      expect(range.length).toBe(21);
    });

    describe("Melee", function () {
      it("should threaten one extra tile than movement range", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 2, y: 2 }], [{ x: 0, y: 0 }]]
        }
        team1[0].skills.push(SKILLS.SILVER_SWORD_PLUS.id);
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateThreatRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(21);
      });
    });

    describe("Ranged", function () {
      beforeEach(function () {
        team1[0].unitId = UNIT.NINO.id;
      });

      it("should threaten two extra tiles than movement range", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS],
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 2, y: 2 }], [{ x: 0, y: 0 }]]
        }
        team1[0].skills.push(SKILLS.REXCALIBUR_PLUS.id);
        const gameState = engine.newGame(map, team1, team2);
        const range = engine.calculateThreatRange(gameState, gameState.teams[0][0]);
        expect(range.length).toBe(25);
      });
    });
  });

  describe("Generate Actions", function () {
    beforeEach(function () {
      team1 = [createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id])];
    });

    it("should attack enemy", function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 0, y: 0 }], [{ x: 3, y: 0 }]]
      }
      const gameState = engine.newGame(map, team1, team2);
      const actions = engine.generateActions(gameState, gameState.teams[0][0]);
      expect(actions.length).toBe(4);
      expect(actions.filter(action => action.target).length).toBe(1);
    });
  });

  describe("Combat", function () {
    beforeEach(function () {
      map = {
        name: "test map",
        terrain: [
          [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
        ],
        defensiveTerrain: [],
        blocks: [],
        startingPositions: [[{ x: 0, y: 0 }], [{ x: 3, y: 0 }]]
      }
      team1 = [createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id])];
      team2 = [createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id])];
    });

    it("should add damage to combat sequence", function () {
      const gameState = engine.newGame(map, team1, team2);
      const unit = gameState.teams[0][0];
      const foe = gameState.teams[1][0];
      const results = engine.calculateCombatResult(gameState, unit, foe);
      const firstAttack = results.sequence[0];
      const counterattack = results.sequence[1];
      expect(firstAttack).toEqual(jasmine.objectContaining({
        attacker: unit.id,
        defender: foe.id,
        damage: 18
      }));
      expect(counterattack).toEqual(jasmine.objectContaining({
        attacker: foe.id,
        defender: unit.id,
        damage: 18
      }));
      expect(results.units[0].stats.hp).toBe(25);
      expect(results.units[1].stats.hp).toBe(25);
      expect(results.combatState.complete).toBe(true);
    });

    it("should gain stats on defensive terrain", function () {
      map.defensiveTerrain.push({ x: 0, y: 0 });
      const gameState = engine.newGame(map, team1, team2);
      const unit = gameState.teams[0][0];
      const foe = gameState.teams[1][0];
      const results = engine.calculateCombatResult(gameState, unit, foe);
      const counterattackDamage = results.sequence[1].damage;
      expect(counterattackDamage).toBe(foe.stats.atk - Math.floor(unit.stats.def * 1.3));
    });

    describe("Buffs and Debuffs", function () {
      it("should account for buffs in damage calculation", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.buffs.atk = 6;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const firstAttack = results.sequence[0];
        const counterattack = results.sequence[1];
        expect(firstAttack).toEqual(jasmine.objectContaining({
          attacker: unit.id,
          defender: foe.id,
          damage: 24
        }));
        expect(counterattack).toEqual(jasmine.objectContaining({
          attacker: foe.id,
          defender: unit.id,
          damage: 18
        }));
        expect(results.units[0].stats.hp).toBe(25);
        expect(results.units[1].stats.hp).toBe(19);
      });

      it("should account for debuffs in damage calculation", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.debuffs.def = 6;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const firstAttack = results.sequence[0];
        const counterattack = results.sequence[1];
        expect(firstAttack).toEqual(jasmine.objectContaining({
          attacker: unit.id,
          defender: foe.id,
          damage: 24
        }));
        expect(counterattack).toEqual(jasmine.objectContaining({
          attacker: foe.id,
          defender: unit.id,
          damage: 18
        }));
        expect(results.units[0].stats.hp).toBe(25);
        expect(results.units[1].stats.hp).toBe(19);
      });

      it("should turn buffs negative when panicked", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.buffs.atk = 6;
        unit.penalties.push(STATUS.PANIC.id);
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const firstAttack = results.sequence[0];
        const counterattack = results.sequence[1];
        expect(firstAttack).toEqual(jasmine.objectContaining({
          attacker: unit.id,
          defender: foe.id,
          damage: 12
        }));
        expect(counterattack).toEqual(jasmine.objectContaining({
          attacker: foe.id,
          defender: unit.id,
          damage: 18
        }));
        expect(results.units[0].stats.hp).toBe(25);
        expect(results.units[1].stats.hp).toBe(31);
      });

      it("should neutralize bonuses by inflicting temporary debuffs of the same amount", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.buffs.atk = 6;
        const foe = gameState.teams[1][0];
        foe.skills.push(SKILLS.DULL_CLOSE_3.id);
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].tempStats.atk).toBe(-6);
      });

      it("should neutralize penalties by inflicting temporary buffs of the same amount", function () {
        team1 = [createBuild(UNIT.NOWI.id, [SKILLS.PURIFYING_BREATH.id + "_REFINE_EFF"])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.debuffs.atk = 6;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].tempStats.atk).toBe(4 + 6);
      });

      it("should neutralize panicked bonuses", function () {
        team1 = [createBuild(UNIT.NOWI.id, [SKILLS.PURIFYING_BREATH.id + "_REFINE_EFF"])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.buffs.atk = 6;
        unit.penalties.push(STATUS.PANIC.id);
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].tempStats.atk).toBe(4 + 6);
      });
    });

    describe("Blade Effect", function () {
      beforeEach(function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 3, y: 0 }]]
        }
        team1 = [createBuild(UNIT.NINO.id, [SKILLS.GRONNBLADE_PLUS.id])];
        team2 = [createBuild(UNIT.ALFONSE.id)];
      });

      it("should do blade things", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.buffs.atk = 6;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].tempStats.atk).toBe(6);
      });

      it("should not do blade things when bonuses neutralized", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.buffs.atk = 6;
        const foe = gameState.teams[1][0];
        foe.skills.push(SKILLS.DULL_RANGED_3.id);
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].tempStats.atk).toBe(-6);
      });

      it("should not do blade things when affected by panic", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.buffs.atk = 6;
        unit.penalties.push(STATUS.PANIC.id);
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].tempStats.atk).toBe(0);
      });
    });

    describe("Stats", function () {
      it("Death Blow should stats on player phase", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.skills.push(SKILLS.DEATH_BLOW_3.id);
        const foe = gameState.teams[1][0];
        foe.skills.push(SKILLS.DEATH_BLOW_3.id);
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const firstAttack = results.sequence[0];
        const counterattack = results.sequence[1];
        expect(firstAttack).toEqual(jasmine.objectContaining({
          attacker: unit.id,
          defender: foe.id,
          damage: 24
        }));
        expect(counterattack).toEqual(jasmine.objectContaining({
          attacker: foe.id,
          defender: unit.id,
          damage: 18
        }));
        expect(results.units[0].stats.hp).toBe(25);
        expect(results.units[1].stats.hp).toBe(19);
        expect(results.units[0].tempStats.atk).toBe(6);
        expect(results.units[1].tempStats.atk).toBe(0);
      });

      it("Steady Blow should add stats on enemy phase", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.skills.push(SKILLS.STEADY_STANCE_3.id);
        const foe = gameState.teams[1][0];
        foe.skills.push(SKILLS.STEADY_STANCE_3.id);
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const firstAttack = results.sequence[0];
        const counterattack = results.sequence[1];
        expect(firstAttack).toEqual(jasmine.objectContaining({
          attacker: unit.id,
          defender: foe.id,
          damage: 12
        }));
        expect(counterattack).toEqual(jasmine.objectContaining({
          attacker: foe.id,
          defender: unit.id,
          damage: 18
        }));
        expect(results.units[0].stats.hp).toBe(25);
        expect(results.units[1].stats.hp).toBe(31);
        expect(results.units[0].tempStats.def).toBe(0);
        expect(results.units[1].tempStats.def).toBe(6);
      });

      it("Close Def should add stats against melee", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.skills.push(SKILLS.CLOSE_DEF_3.id);
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[1].tempStats.def).toBe(6);
        expect(results.units[1].tempStats.res).toBe(6);
      });

      it("Close Def should not add stats against ranged", function () {
        team1 = [createBuild(UNIT.NINO.id, [SKILLS.REXCALIBUR_PLUS.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.skills.push(SKILLS.CLOSE_DEF_3.id);
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[1].tempStats.def).toBe(0);
        expect(results.units[1].tempStats.res).toBe(0);
      });

      it("Fire Boost should add stats if has >= 3 hp", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.skills.push(SKILLS.FIRE_BOOST_3.id);
        const foe = gameState.teams[1][0];
        foe.skills.push(SKILLS.FIRE_BOOST_3.id);
        foe.stats.hp -= 3;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].tempStats.atk).toBe(6);
        expect(results.units[1].tempStats.atk).toBe(0);
      });

      it("Bond should add stats if adjacent", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }, { x: 1, y: 0 }], [{ x: 2, y: 0 }, { x: 4, y: 0 }]]
        }
        team1 = [
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id, SKILLS.ATK_DEF_BOND_3.id]),
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id])
        ];
        team2 = [
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id, SKILLS.ATK_DEF_BOND_3.id]),
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id])
        ];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].tempStats.atk).toBe(5);
        expect(results.units[0].tempStats.def).toBe(5);
        expect(results.units[1].tempStats.atk).toBe(0);
        expect(results.units[1].tempStats.def).toBe(0);
      });

      it("Spur should add stats to adjacent allies", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }, { x: 1, y: 0 }], [{ x: 2, y: 0 }, { x: 4, y: 0 }]]
        }
        team1 = [
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id]),
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id, SKILLS.SPUR_ATK_3.id])
        ];
        team2 = [
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id]),
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id, SKILLS.SPUR_ATK_3.id])
        ];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].tempStats.atk).toBe(4);
        expect(results.units[1].tempStats.atk).toBe(0);
      });

      it("Drive should add stats to allies within 2 spaces", function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }, { x: 1, y: 0 }], [{ x: 2, y: 0 }, { x: 4, y: 0 }]]
        }
        team1 = [
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id]),
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id, SKILLS.DRIVE_ATK_2.id])
        ];
        team2 = [
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id]),
          createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id, SKILLS.DRIVE_ATK_2.id])
        ];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].tempStats.atk).toBe(3);
        expect(results.units[1].tempStats.atk).toBe(3);
      });
    });

    describe("Can Counter", function () {
      it("should counter against unit with same range", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence.length).toBe(2);
        expect(results.units[1].canAttack).toBeTrue();
      });

      it("should not counter against unit with different range", function () {
        team1 = [createBuild(UNIT.NINO.id, [SKILLS.REXCALIBUR_PLUS.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[1].canAttack).toBeFalse();
        expect(results.sequence[0].attacker).toBe(unit.id);
        const results2 = engine.calculateCombatResult(gameState, foe, unit);
        expect(results2.units[1].canAttack).toBeFalse();
        expect(results2.sequence[0].attacker).toBe(foe.id);
      });

      it("should counter regardless of range", function () {
        team1 = [createBuild(UNIT.NINO.id, [SKILLS.REXCALIBUR_PLUS.id, SKILLS.CLOSE_COUNTER.id])];
        team2[0].skills.push(SKILLS.DISTANT_COUNTER.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.def += 20; // make sure doesn't die
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[1].canAttack).toBeTrue();
        expect(results.sequence[0].attacker).toBe(unit.id);
        expect(results.sequence[1].attacker).toBe(foe.id);
        const results2 = engine.calculateCombatResult(gameState, foe, unit);
        expect(results2.units[1].canAttack).toBeTrue();
        expect(results2.sequence[0].attacker).toBe(foe.id);
        expect(results2.sequence[1].attacker).toBe(unit.id);
      });

      it("Windsweep should not allow follow up and foe can't counter", function () {
        team1[0].skills.push(SKILLS.WINDSWEEP_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        unit.stats.spd += 5;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence.length).toBe(1);
        expect(results.units[1].canAttack).toBeFalse();
        expect(results.units[0].canDouble).toBeFalse();
      });

      it("should not counter if died from attack", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.stats.hp = 1;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence.length).toBe(1);
        expect(results.units[1].canAttack).toBeTrue();
      });
    });

    describe("Follow Ups", function () {
      it("should allow follow up if >= 5 spd", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        unit.stats.spd += 5;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].canDouble).toBeTrue();
        expect(results.units[1].canDouble).toBeFalse();
      });

      it("should onmi break with correct breaker skill", function () {
        team1[0].skills.push(SKILLS.SWORDBREAKER_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.stats.spd += 5;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].canDouble).toBeTrue();
        expect(results.units[1].canDouble).toBeFalse();
      });

      it("should not onmi break with incorrect breaker skill", function () {
        team1[0].skills.push(SKILLS.AXEBREAKER_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.stats.spd += 5;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].canDouble).toBeFalse();
        expect(results.units[1].canDouble).toBeTrue();
      });

      it("should turn into a spd check with conflicting follow ups", function () {
        team1[0].skills.push(SKILLS.SWORDBREAKER_3.id);
        team2[0].skills.push(SKILLS.QUICK_RIPOSTE_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.stats.spd += 5;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].canDouble).toBeTrue();
        expect(results.units[1].canDouble).toBeTrue();
      });

      it("should do Brash Assault things", function () {
        team1[0].skills.push(SKILLS.BRASH_ASSAULT_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        unit.stats.hp = 20;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].canDouble).toBeTrue();
      });
    });

    describe("Attack Order", function () {
      it("should counter first with vantage and hp condition met", function () {
        team2[0].skills.push(SKILLS.VANTAGE_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.stats.hp = 20;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence[0].attacker).toBe(foe.id);
        expect(results.sequence[1].attacker).toBe(unit.id);
      });

      it("should not counter first with vantage and hp condition not met", function () {
        team2[0].skills.push(SKILLS.VANTAGE_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence[0].attacker).toBe(unit.id);
        expect(results.sequence[1].attacker).toBe(foe.id);
      });

      it("should not counter first with vantage and hp condition met but foe has hardy bearing", function () {
        team1[0].skills.push(SKILLS.HARDY_BEARING_3.id);
        team2[0].skills.push(SKILLS.VANTAGE_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.stats.hp = 20;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence[0].attacker).toBe(unit.id);
        expect(results.sequence[1].attacker).toBe(foe.id);
      });

      it("should not counter first with vantage and hp condition met but unit has hardy bearing", function () {
        team2[0].skills.push(SKILLS.VANTAGE_3.id, SKILLS.HARDY_BEARING_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.stats.hp = 20;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence[0].attacker).toBe(unit.id);
        expect(results.sequence[1].attacker).toBe(foe.id);
      });

      it("should attack before counter with desperation and hp condition met", function () {
        team1[0].skills.push(SKILLS.DESPERATION_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        unit.stats.hp = 20;
        unit.stats.spd += 5;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence[0].attacker).toBe(unit.id);
        expect(results.sequence[1].attacker).toBe(unit.id);
        expect(results.sequence[2].attacker).toBe(foe.id);
      });

      it("should not attack before counter with desperation and hp condition not met", function () {
        team1[0].skills.push(SKILLS.DESPERATION_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        unit.stats.spd += 5;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence[0].attacker).toBe(unit.id);
        expect(results.sequence[1].attacker).toBe(foe.id);
        expect(results.sequence[2].attacker).toBe(unit.id);
      });

      it("should not attack before counter with desperation and hp condition met but foe has hardy bearing", function () {
        team1[0].skills.push(SKILLS.DESPERATION_3.id);
        team2[0].skills.push(SKILLS.HARDY_BEARING_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        unit.stats.hp = 20;
        unit.stats.spd += 5;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence[0].attacker).toBe(unit.id);
        expect(results.sequence[1].attacker).toBe(foe.id);
        expect(results.sequence[2].attacker).toBe(unit.id);
      });

      it("should not attack before counter with desperation and hp condition met but unit has hardy bearing", function () {
        team1[0].skills.push(SKILLS.DESPERATION_3.id, SKILLS.HARDY_BEARING_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        unit.stats.hp = 20;
        unit.stats.spd += 5;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence[0].attacker).toBe(unit.id);
        expect(results.sequence[1].attacker).toBe(foe.id);
        expect(results.sequence[2].attacker).toBe(unit.id);
      });

      it("should attack twice with brave weapon", function () {
        team1 = [createBuild(UNIT.ALFONSE.id, [SKILLS.BRAVE_SWORD_PLUS.id])];
        team2 = [createBuild(UNIT.ALFONSE.id, [SKILLS.BRAVE_SWORD_PLUS.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence.length).toBe(3);
        expect(results.sequence[0].attacker).toBe(unit.id);
        expect(results.sequence[1].attacker).toBe(unit.id);
        expect(results.sequence[2].attacker).toBe(foe.id);
      });

      it("should quad with brave weapon and can follow up", function () {
        team1 = [createBuild(UNIT.ALFONSE.id, [SKILLS.BRAVE_SWORD_PLUS.id])];
        team2 = [createBuild(UNIT.ALFONSE.id, [SKILLS.BRAVE_SWORD_PLUS.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.spd += 5;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence.length).toBe(5);
        expect(results.sequence[0].attacker).toBe(unit.id);
        expect(results.sequence[1].attacker).toBe(unit.id);
        expect(results.sequence[2].attacker).toBe(foe.id);
        expect(results.sequence[3].attacker).toBe(unit.id);
        expect(results.sequence[4].attacker).toBe(unit.id);
      });
    });

    describe("Special Charge", function () {
      it("should gain special charge per hit", function () {
        team1[0].skills.push(SKILLS.AETHER.id);
        team2[0].skills.push(SKILLS.BLAZING_WIND.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        expect(unit.special.max).toBe(5);
        expect(unit.special.current).toBe(5);
        expect(foe.special.max).toBe(4);
        expect(foe.special.current).toBe(4);
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].special.max).toBe(5);
        expect(results.units[0].special.current).toBe(3);
        expect(results.units[1].special.max).toBe(4);
        expect(results.units[1].special.current).toBe(2);
      });

      it("should not gain special charge per hit when affected by guard", function () {
        team1[0].skills.push(SKILLS.AETHER.id);
        team2[0].skills.push(SKILLS.BLAZING_WIND.id, SKILLS.GUARD_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].special.current).toBe(5);
      });

      it("should gain extra special charge per unit's hit", function () {
        team1[0].skills.push(SKILLS.AETHER.id, SKILLS.HEAVY_BLADE_3.id);
        team2[0].skills.push(SKILLS.BLAZING_WIND.id, SKILLS.HEAVY_BLADE_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.atk += 1;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].special.current).toBe(2);
        expect(results.units[0].special.current).toBe(2);
      });

      it("should gain extra special charge per hit", function () {
        team1[0].skills.push(SKILLS.AETHER.id, SKILLS.STEADY_BREATH.id);
        team2[0].skills.push(SKILLS.BLAZING_WIND.id, SKILLS.STEADY_BREATH.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].special.current).toBe(3);
        expect(results.units[1].special.current).toBe(0);
      });

      it("should cancel out extra special charge with guard", function () {
        team1[0].skills.push(SKILLS.AETHER.id, SKILLS.HEAVY_BLADE_3.id, SKILLS.GUARD_3.id);
        team2[0].skills.push(SKILLS.BLAZING_WIND.id, SKILLS.STEADY_BREATH.id, SKILLS.GUARD_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.atk += 1;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].special.current).toBe(4);
        expect(results.units[1].special.current).toBe(2);
      });
    })

    describe("Weapon Advantage", function () {
      it("should not have advantage against same colour", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].advantageMod).toBe(0);
        expect(results.units[1].advantageMod).toBe(0);
      });

      it("red beats green", function () {
        team2 = [createBuild(UNIT.BARTRE.id)];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].advantageMod).toBe(0.2);
        expect(results.units[1].advantageMod).toBe(-0.2);
      });

      it("green beats blue", function () {
        team1 = [createBuild(UNIT.BARTRE.id, [SKILLS.SILVER_AXE_PLUS.id])];
        team2 = [createBuild(UNIT.ABEL.id, [SKILLS.SILVER_LANCE_PLUS.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].advantageMod).toBe(0.2);
        expect(results.units[1].advantageMod).toBe(-0.2);
      });

      it("blue beats red", function () {
        team1 = [createBuild(UNIT.ABEL.id, [SKILLS.SILVER_LANCE_PLUS.id])];
        team2 = [createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].advantageMod).toBe(0.2);
        expect(results.units[1].advantageMod).toBe(-0.2);
      });

      it("raven beats colourless", function () {
        team1 = [createBuild(UNIT.CECILIA.id, [SKILLS.GRONNRAVEN_PLUS.id])];
        team2 = [createBuild(UNIT.JEORGE.id, [SKILLS.SILVER_BOW_PLUS.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].advantageMod).toBe(0.2);
        expect(results.units[1].advantageMod).toBe(-0.2);
      });

      it("should gain affinity from Triangle Adept", function () {
        team1 = [createBuild(UNIT.CECILIA.id, [SKILLS.GRONNRAVEN_PLUS.id, SKILLS.TRIANGLE_ADEPT_3.id])];
        team2 = [createBuild(UNIT.JEORGE.id, [SKILLS.SILVER_BOW_PLUS.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].advantageMod).toBe(0.4);
        expect(results.units[1].advantageMod).toBe(-0.4);
      });

      it("should gain negative affinity from Triangle Adept", function () {
        team1 = [createBuild(UNIT.CECILIA.id, [SKILLS.GRONNRAVEN_PLUS.id])];
        team2 = [createBuild(UNIT.JEORGE.id, [SKILLS.SILVER_BOW_PLUS.id, SKILLS.TRIANGLE_ADEPT_3.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].advantageMod).toBe(0.4);
        expect(results.units[1].advantageMod).toBe(-0.4);
      });

      it("should not stack affinity", function () {
        team1 = [createBuild(UNIT.ALFONSE.id, [SKILLS.RUBY_SWORD_PLUS.id, SKILLS.TRIANGLE_ADEPT_3.id])];
        team2 = [createBuild(UNIT.BARTRE.id, [SKILLS.EMERALD_AXE_PLUS.id, SKILLS.TRIANGLE_ADEPT_3.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].advantageMod).toBe(0.4);
        expect(results.units[1].advantageMod).toBe(-0.4);
      });

      it("should reverse affinity", function () {
        team1 = [createBuild(UNIT.CECILIA.id, [SKILLS.GRONNRAVEN_PLUS.id, SKILLS.TRIANGLE_ADEPT_3.id])];
        team2 = [createBuild(UNIT.JEORGE.id, [SKILLS.SILVER_BOW_PLUS.id, SKILLS.CANCEL_AFFINITY_3.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].advantageMod).toBe(0);
        expect(results.units[1].advantageMod).toBe(0);
      });
    });

    describe("Effective Damage", function () {
      it("should have effective damage against move type", function () {
        team1 = [createBuild(UNIT.ALFONSE.id, [SKILLS.ARMOURSMASHER_PLUS.id])];
        team2 = [createBuild(UNIT.DRAUG.id, [SKILLS.SILVER_SWORD_PLUS.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].effectiveMod).toBe(0.5);
        expect(results.units[1].effectiveMod).toBe(0);
      });

      it("should neutralize effective damage against move type", function () {
        team1 = [createBuild(UNIT.ALFONSE.id, [SKILLS.ARMOURSMASHER_PLUS.id])];
        team2 = [createBuild(UNIT.DRAUG.id, [SKILLS.SILVER_SWORD_PLUS.id, SKILLS.SVALINN_SHIELD.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].effectiveMod).toBe(0);
        expect(results.units[1].effectiveMod).toBe(0);
      });

      it("should have effective damage against weapon type", function () {
        team1 = [createBuild(UNIT.CHROM.id, [SKILLS.FALCHION_AWAKENING.id])];
        team2 = [createBuild(UNIT.NOWI.id, [SKILLS.LIGHTNING_BREATH_PLUS.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].effectiveMod).toBe(0.5);
        expect(results.units[1].effectiveMod).toBe(0);
      });
    });

    describe("Adaptive Damage", function () {
      it("should use lower of def or res", function () {
        team1 = [createBuild(UNIT.NOWI.id, [SKILLS.FLAMETONGUE_PLUS.id])];
        team2 = [createBuild(UNIT.FELICIA.id)];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const normalDamage = results.sequence[0].damage;
        team1 = [{
          unitId: UNIT.NOWI.id,
          level: 40,
          merges: 0,
          skills: [SKILLS.FLAMETONGUE_PLUS.id + "_REFINE_DEF"]
        }];
        const gameState2 = engine.newGame(map, team1, team2);
        const unit2 = gameState2.teams[0][0];
        const foe2 = gameState2.teams[1][0];
        const results2 = engine.calculateCombatResult(gameState2, unit2, foe2);
        const adaptiveDamage = results2.sequence[0].damage;
        expect(adaptiveDamage - normalDamage).toBe(foe.stats.res - foe.stats.def);
      });
    });

    describe("Staff Damage", function () {
      it("should do double damage with Wrathful Staff the skill", function () {
        team1 = [createBuild(UNIT.WRYS.id, [SKILLS.SLOW_PLUS.id])];
        team2 = [createBuild(UNIT.ALFONSE.id)];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].staffMod).toBe(0.5);
        const halfDamage = results.sequence[0].damage;
        team1 = [{
          unitId: UNIT.WRYS.id,
          level: 40,
          merges: 0,
          skills: [SKILLS.SLOW_PLUS.id, SKILLS.WRATHFUL_STAFF.id]
        }];
        const gameState2 = engine.newGame(map, team1, team2);
        const unit2 = gameState2.teams[0][0];
        const foe2 = gameState2.teams[1][0];
        const results2 = engine.calculateCombatResult(gameState2, unit2, foe2);
        expect(results2.units[0].staffMod).toBe(1);
        const wrathfulDamage = results2.sequence[0].damage;
        expect(wrathfulDamage).toBeGreaterThanOrEqual(halfDamage * 2);
      });

      it("should do double damage with Wrathful refine", function () {
        team1 = [createBuild(UNIT.WRYS.id, [SKILLS.SLOW_PLUS.id])];
        team2 = [createBuild(UNIT.ALFONSE.id)];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].staffMod).toBe(0.5);
        const halfDamage = results.sequence[0].damage;
        team1 = [createBuild(UNIT.WRYS.id, [SKILLS.SLOW_PLUS.id + "_REFINE_WRATHFUL"])];
        const gameState2 = engine.newGame(map, team1, team2);
        const unit2 = gameState2.teams[0][0];
        const foe2 = gameState2.teams[1][0];
        const results2 = engine.calculateCombatResult(gameState2, unit2, foe2);
        expect(results2.units[0].staffMod).toBe(1);
        const wrathfulDamage = results2.sequence[0].damage;
        expect(wrathfulDamage).toBeGreaterThanOrEqual(halfDamage * 2);
      });
    });

    describe("Offensive Specials", function () {
      it("should do Moonbow things", function () {
        team1[0].skills.push(SKILLS.MOONBOW.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.spd += 5;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const damageFromFirstHit = results.sequence[0].damage;
        const damageFromSecondHit = results.sequence[2].damage;
        expect(damageFromFirstHit).toBe(unit.stats.atk - foe.stats.def);
        expect(damageFromSecondHit).toBe(unit.stats.atk - foe.stats.def + Math.floor(foe.stats.def * 0.3));
        expect(results.units[0].special.current).toBe(2);
      });

      it("should add damage on special trigger", function () {
        team1 = [createBuild(UNIT.ALFONSE.id, [SKILLS.WO_DAO_PLUS.id, SKILLS.MOONBOW.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.spd += 5;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const damageFromFirstHit = results.sequence[0].damage;
        const damageFromSecondHit = results.sequence[2].damage;
        expect(damageFromFirstHit).toBe(unit.stats.atk - foe.stats.def);
        expect(damageFromSecondHit).toBe(unit.stats.atk - foe.stats.def + Math.floor(foe.stats.def * 0.3) + 10);
        expect(results.units[0].special.current).toBe(2);
      });

      it("should do Noontime things", function () {
        team1[0].skills.push(SKILLS.NOONTIME.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.spd += 5;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const damageDealtToUnit = results.sequence[1].damage;
        const damageFromSecondHit = results.sequence[2].damage;
        const healingFromSecondHit = results.sequence[2].healing;
        expect(healingFromSecondHit).toBe(Math.floor(damageFromSecondHit * 0.3));
        expect(results.units[0].stats.hp).toBe(unit.stats.maxHp - damageDealtToUnit + healingFromSecondHit);
      });

      it("should do Glimmer things", function () {
        team1[0].skills.push(SKILLS.GLIMMER.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.spd += 5;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const damageFromSecondHit = results.sequence[2].damage;
        expect(damageFromSecondHit).toBe(Math.floor((unit.stats.atk - foe.stats.def) * 1.5));
      });

      it("should do Reprisal things", function () {
        team1[0].skills.push(SKILLS.REPRISAL.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.spd += 5;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const damageDealtToUnit = results.sequence[1].damage;
        const damageFromSecondHit = results.sequence[2].damage;
        expect(damageFromSecondHit).toBe(unit.stats.atk - foe.stats.def + Math.floor(damageDealtToUnit * 0.3));
      });

      it("should do Draconic Aura things", function () {
        team1[0].skills.push(SKILLS.DRACONIC_AURA.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.spd += 5;
        unit.special.current = 2;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const damageFromSecondHit = results.sequence[2].damage;
        expect(damageFromSecondHit).toBe(unit.stats.atk - foe.stats.def + Math.floor(unit.stats.atk * 0.3));
      });

      it("should do Bonfire things", function () {
        team1[0].skills.push(SKILLS.BONFIRE.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.spd += 5;
        unit.special.current = 2;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const damageFromSecondHit = results.sequence[2].damage;
        expect(damageFromSecondHit).toBe(unit.stats.atk - foe.stats.def + Math.floor(unit.stats.def * 0.5));
      });

      it("should do Iceberg things", function () {
        team1[0].skills.push(SKILLS.ICEBERG.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.spd += 5;
        unit.special.current = 2;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const damageFromSecondHit = results.sequence[2].damage;
        expect(damageFromSecondHit).toBe(unit.stats.atk - foe.stats.def + Math.floor(unit.stats.res * 0.5));
      });
    });

    describe("Defensive Specials", function () {
      it("should not trigger if incorrect range", function () {
        team2[0].skills.push(SKILLS.SACRED_COWL.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.spd += 5;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const damageFromFirstHit = results.sequence[0].damage;
        const damageFromSecondHit = results.sequence[2].damage;
        expect(damageFromSecondHit).toBe(damageFromFirstHit);
      });

      it("should do Escutcheon things", function () {
        team2[0].skills.push(SKILLS.ESCUTCHEON.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.stats.spd += 5;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const damageFromFirstHit = results.sequence[0].damage;
        const damageFromSecondHit = results.sequence[2].damage;
        expect(damageFromSecondHit).toBe(damageFromFirstHit - Math.floor(damageFromFirstHit * 0.3));
      });

      it("should do Miracle things", function () {
        team2[0].skills.push(SKILLS.MIRACLE.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.stats.hp = 2;
        foe.special.current = 0;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.sequence[0].damage).toBe(1);
        expect(results.units[1].stats.hp).toBe(1);
      });

      it("should not do Miracle things on 1 hp", function () {
        team2[0].skills.push(SKILLS.MIRACLE.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.stats.hp = 1;
        foe.special.current = 0;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[1].stats.hp).toBe(0);
      });
    });

    describe("Area of Effect Specials", function () {
      beforeEach(function () {
        map = {
          name: "test map",
          terrain: [
            [TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS, TERRAIN.PLAINS]
          ],
          defensiveTerrain: [],
          blocks: [],
          startingPositions: [[{ x: 0, y: 0 }], [{ x: 3, y: 0 }, { x: 4, y: 0 }]]
        }
        team1 = [createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id, SKILLS.BLAZING_WIND.id])]
        team2 = [createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id])];
      });

      it("should trigger aoe special", function () {
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.special.current = 0;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const aoeHit = results.sequence[0];
        const expectedDamage = Math.floor((unit.stats.atk - foe.stats.def) * 1.5);
        expect(aoeHit).toEqual(jasmine.objectContaining({
          attacker: unit.id,
          defender: foe.id,
          damage: expectedDamage,
          aoe: true
        }));
        expect(results.units[0].special.current).toBe(3);
        expect(results.units[1].startOfCombatHp).toBe(foe.stats.hp - expectedDamage);
      });

      it("should vantage after hit by aoe", function () {
        team2[0].skills.push(SKILLS.VANTAGE_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.special.current = 0;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const vantageHit = results.sequence[1];
        expect(vantageHit).toEqual(jasmine.objectContaining({
          attacker: foe.id,
          defender: unit.id
        }));
      });

      it("should do extra aoe damage from Wrath", function () {
        team1[0].skills.push(SKILLS.WRATH_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.special.current = 0;
        unit.stats.hp = 20;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const aoeHit = results.sequence[0];
        expect(aoeHit).toEqual(jasmine.objectContaining({
          attacker: unit.id,
          defender: foe.id,
          damage: Math.floor((unit.stats.atk - foe.stats.def) * 1.5) + 10,
          aoe: true
        }));
      });

      it("should hit other foes", function () {
        team2.push(createBuild(UNIT.NINO.id));
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.special.current = 0;
        const foe = gameState.teams[1][0];
        const nino = gameState.teams[1][1];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const aoeHit = results.sequence[0];
        const aoeHit2 = results.sequence[1];
        expect(aoeHit).toEqual(jasmine.objectContaining({
          attacker: unit.id,
          defender: foe.id,
          damage: Math.floor((unit.stats.atk - foe.stats.def) * 1.5),
          aoe: true
        }));
        expect(aoeHit2).toEqual(jasmine.objectContaining({
          attacker: unit.id,
          defender: nino.id,
          damage: Math.floor((unit.stats.atk - nino.stats.def) * 1.5),
          aoe: true
        }));
      });

      it("should do adaptive damage", function () {
        team1 = [createBuild(UNIT.NOWI.id, [SKILLS.PURIFYING_BREATH.id, SKILLS.BLAZING_WIND.id])];
        team2 = [createBuild(UNIT.NINO.id)];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.special.current = 0;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const aoeHit = results.sequence[0];
        const expectedDamage = Math.floor((unit.stats.atk - foe.stats.def) * 1.5); // (48 - 19) * 1.5 = 43.5 = dead nino
        expect(aoeHit).toEqual(jasmine.objectContaining({
          attacker: unit.id,
          defender: foe.id,
          damage: expectedDamage,
          aoe: true
        }));
        expect(results.units[0].special.current).toBe(4); // because reverse slaying
        expect(results.units[1].startOfCombatHp).toBe(1);
      });

      it("should trigger aoe special on defensive terrain", function () {
        map.defensiveTerrain.push({ x: 3, y: 0 });
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        unit.special.current = 0;
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const aoeHit = results.sequence[0];
        const effectiveDef = Math.floor(foe.stats.def * 1.3);
        const expectedDamage = Math.floor((unit.stats.atk - effectiveDef) * 1.5); // 50 - (32 * 1.3)
        expect(aoeHit).toEqual(jasmine.objectContaining({
          attacker: unit.id,
          defender: foe.id,
          damage: expectedDamage,
          aoe: true
        }));
        expect(results.units[0].special.current).toBe(2);
        expect(results.units[1].startOfCombatHp).toBe(foe.stats.hp - expectedDamage);
      });
    });

    describe("Phantom", function () {
      it("should add phantom stats", function () {
        team1[0].skills.push(SKILLS.PHANTOM_SPD_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        expect(unit.phantomStats.spd).toBe(10);
      });

      it("should use phantom stats for comparisons", function () {
        team1[0].skills.push(SKILLS.AETHER.id, SKILLS.FLASHING_BLADE_3.id, SKILLS.PHANTOM_SPD_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].special.current).toBe(2);
      });

      it("should cancel out phantom stats", function () {
        team1[0].skills.push(SKILLS.AETHER.id, SKILLS.FLASHING_BLADE_3.id, SKILLS.PHANTOM_SPD_3.id);
        team2[0].skills.push(SKILLS.PHANTOM_SPD_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].special.current).toBe(3);
      });
    });

    describe("Consecutive Attacks", function () {
      it("should reduce damage on consecutive follow up", function () {
        team1[0].skills.push(SKILLS.DEFLECT_MELEE_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.stats.spd += 5;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const counterFirstHit = results.sequence[1].damage;
        const counterSecondHit = results.sequence[2].damage;
        const baseDamage = foe.stats.atk - unit.stats.def;
        expect(counterFirstHit).toBe(baseDamage);
        expect(counterSecondHit).toBe(baseDamage - Math.floor(baseDamage * 0.8));
      });

      it("should reduce damage on desperation follow up", function () {
        team1[0].skills.push(SKILLS.DESPERATION_3.id);
        team2[0].skills.push(SKILLS.DEFLECT_MELEE_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        unit.stats.spd += 5;
        unit.stats.hp = 20;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const firstHit = results.sequence[0].damage;
        const secondHit = results.sequence[1].damage;
        const baseDamage = unit.stats.atk - foe.stats.def;
        expect(firstHit).toBe(baseDamage);
        expect(secondHit).toBe(baseDamage - Math.floor(baseDamage * 0.8));
      });

      it("should not reduce damage on non consecutive follow up", function () {
        team2[0].skills.push(SKILLS.DEFLECT_MELEE_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        unit.stats.spd += 5;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const firstHit = results.sequence[0].damage;
        const secondHit = results.sequence[1].damage;
        const baseDamage = unit.stats.atk - foe.stats.def;
        expect(firstHit).toBe(baseDamage);
        expect(secondHit).toBe(baseDamage);
      });

      it("should reduce damage on brave hit", function () {
        team1[0].skills = [SKILLS.BRAVE_SWORD_PLUS.id];
        team2[0].skills.push(SKILLS.DEFLECT_MELEE_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        unit.stats.spd += 10;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const firstBraveHit = results.sequence[0].damage;
        const secondBraveHit = results.sequence[1].damage;
        const thirdBraveHit = results.sequence[3].damage;
        const fourthBraveHit = results.sequence[4].damage;
        const baseDamage = unit.stats.atk - foe.stats.def;
        expect(firstBraveHit).toBe(baseDamage);
        expect(secondBraveHit).toBe(baseDamage - Math.floor(baseDamage * 0.8));
        expect(thirdBraveHit).toBe(baseDamage);
        expect(fourthBraveHit).toBe(baseDamage - Math.floor(baseDamage * 0.8));
      });

      it("should reduce damage on consecutive brave hit", function () {
        team1[0].skills = [SKILLS.BRAVE_SWORD_PLUS.id, SKILLS.DESPERATION_3.id];
        team2[0].skills.push(SKILLS.DEFLECT_MELEE_3.id);
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        unit.stats.spd += 10;
        unit.stats.hp = 20;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        const firstBraveHit = results.sequence[0].damage;
        const secondBraveHit = results.sequence[1].damage;
        const thirdBraveHit = results.sequence[2].damage;
        const fourthBraveHit = results.sequence[3].damage;
        const baseDamage = unit.stats.atk - foe.stats.def;
        expect(firstBraveHit).toBe(baseDamage);
        expect(secondBraveHit).toBe(baseDamage - Math.floor(baseDamage * 0.8));
        expect(thirdBraveHit).toBe(baseDamage - Math.floor(baseDamage * 0.8));
        expect(fourthBraveHit).toBe(baseDamage - Math.floor(baseDamage * 0.8));
      });
    });

    describe("First Combat In Phase", function () {
      it("should do Effie things", function () {
        team1 = [createBuild(UNIT.EFFIE.id, [SKILLS.EFFIES_LANCE.id + "_REFINE_EFF"])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        const foe = gameState.teams[1][0];
        foe.buffs.def = 1;
        const results = engine.calculateCombatResult(gameState, unit, foe);
        expect(results.units[0].tempStats.atk).toBe(6);
        expect(results.units[1].tempStats.atk).toBe(-5);
        expect(results.units[1].tempStats.def).toBe(-6);
      });
    });

    describe("Post Combat Damage", function () {
      it("should do fury things", function () {
        team1 = [createBuild(UNIT.NINO.id, [SKILLS.REXCALIBUR_PLUS.id, SKILLS.FURY_3.id])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        engine.executeAction(gameState, { from: { x: 0, y: 0 }, to: { x: 0, y: 0 }, target: { x: 3, y: 0 } });
        expect(unit.stats.maxHp - unit.stats.hp).toBe(6);
      });

      it("should do double fury things", function () {
        team1 = [createBuild(UNIT.NINO.id, [SKILLS.REXCALIBUR_PLUS.id, SKILLS.FURY_3.id, SKILLS.FURY_3.id + "_SEAL"])];
        const gameState = engine.newGame(map, team1, team2);
        const unit = gameState.teams[0][0];
        engine.executeAction(gameState, { from: { x: 0, y: 0 }, to: { x: 0, y: 0 }, target: { x: 3, y: 0 } });
        expect(unit.stats.maxHp - unit.stats.hp).toBe(12);
      });
    });
  });

  describe("Duel", function () {
    beforeEach(function () {
      map = MAPS.SD15;
      team1 = [
        createBuild(UNIT.ALFONSE.id, [SKILLS.FOLKVANGR.id + "_REFINE_DEF"]),
        createBuild(UNIT.BARTRE.id, [SKILLS.AXE_OF_VIRILITY.id + "_REFINE_EFF"]),
        createBuild(UNIT.CAEDA.id, [SKILLS.WING_SWORD.id + "_REFINE_EFF"]),
        createBuild(UNIT.DRAUG.id, [SKILLS.STALWART_SWORD.id + "_REFINE_EFF"]),
        createBuild(UNIT.ELIWOOD.id, [SKILLS.DURANDAL.id + "_REFINE_EFF"])
      ];
      team2 = [
        createBuild(UNIT.FAE.id, [SKILLS.ETERNAL_BREATH.id + "_REFINE_EFF"]),
        createBuild(UNIT.GWENDOLYN.id, [SKILLS.WEIGHTED_LANCE.id + "_REFINE_EFF"]),
        createBuild(UNIT.HENRY.id, [SKILLS.CORVUS_TOME.id + "_REFINE_EFF"]),
        createBuild(UNIT.JEORGE.id, [SKILLS.BRAVE_BOW_PLUS.id]),
        createBuild(UNIT.NINO.id, [SKILLS.IRISS_TOME.id + "_REFINE_EFF"])
      ];
    });

    function dummyAction(gameState) {
      for (let unit of gameState.teams[gameState.currentTurn]) {
        if (!unit.hasAction) continue;
        const actions = engine.generateActions(gameState, unit);
        engine.executeAction(gameState, actions[0]);
        return;
      }
    }

    it("should give first move to team with more actions remaining", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      expect(gameState.turnCount).toBe(1);
      expect(gameState.currentTurn).toBe(0);
      gameState.duelState[0].actionsRemaining = 3;
      engine.endTurn(gameState);
      expect(gameState.currentTurn).toBe(1);
      engine.endTurn(gameState);
      expect(gameState.turnCount).toBe(2);
      expect(gameState.currentTurn).toBe(1);
      expect(gameState.lastStartingTeam).toBe(1);
      expect(gameState.duelState[0].actionsRemaining).toBe(6);
      expect(gameState.duelState[1].actionsRemaining).toBe(6);
    });

    it("should give first move to whoever moved first last turn", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      expect(gameState.turnCount).toBe(1);
      expect(gameState.currentTurn).toBe(0);
      engine.endTurn(gameState);
      expect(gameState.currentTurn).toBe(1);
      engine.endTurn(gameState);
      expect(gameState.turnCount).toBe(2);
      expect(gameState.currentTurn).toBe(0);
      expect(gameState.lastStartingTeam).toBe(0);
    });

    it("should automatically end turn when used all actions", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      expect(gameState.duelState[0].endedTurn).toBeFalse();
      expect(gameState.duelState[1].endedTurn).toBeFalse();
      gameState.duelState[0].actionsRemaining = 2;
      dummyAction(gameState);
      expect(gameState.duelState[0].actionsRemaining).toBe(1);
      expect(gameState.currentTurn).toBe(1);
      dummyAction(gameState);
      expect(gameState.duelState[1].actionsRemaining).toBe(5);
      expect(gameState.currentTurn).toBe(0);
      dummyAction(gameState);
      expect(gameState.duelState[0].actionsRemaining).toBe(0);
      expect(gameState.duelState[0].endedTurn).toBeTrue();
      expect(gameState.currentTurn).toBe(1);
      dummyAction(gameState);
      expect(gameState.duelState[1].actionsRemaining).toBe(4);
      expect(gameState.currentTurn).toBe(1);
      dummyAction(gameState);
      expect(gameState.duelState[1].actionsRemaining).toBe(3);
      expect(gameState.currentTurn).toBe(1);
    });

    it("should automatically end turn when run out of eligible actions", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      expect(gameState.duelState[0].endedTurn).toBeFalse();
      expect(gameState.duelState[1].endedTurn).toBeFalse();
      dummyAction(gameState);
      dummyAction(gameState);
      dummyAction(gameState);
      dummyAction(gameState);
      dummyAction(gameState);
      dummyAction(gameState);
      dummyAction(gameState);
      dummyAction(gameState);
      dummyAction(gameState);
      expect(gameState.duelState[0].endedTurn).toBeTrue();
      dummyAction(gameState);
      expect(gameState.turnCount).toBe(2);
    });

    it("should get multiple actions in a row when opponent ended turn", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      expect(gameState.turnCount).toBe(1);
      expect(gameState.currentTurn).toBe(0);
      engine.endTurn(gameState);
      expect(gameState.currentTurn).toBe(1);
      dummyAction(gameState);
      expect(gameState.currentTurn).toBe(1);
    });

    it("should end game after 5 turns and declare win to team with highest score", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      gameState.turnCount = 5;
      gameState.duelState[0].koScore = 1;
      engine.endTurn(gameState);
      engine.endTurn(gameState);
      expect(gameState.turnCount).toBe(5);
      expect(gameState.gameOver).toBeTrue();
      expect(gameState.duelState[0].result).toBe("win");
      expect(gameState.duelState[1].result).toBe("lose");
    });

    it("should end game after 5 turns and declare a draw", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      gameState.turnCount = 5;
      engine.endTurn(gameState);
      engine.endTurn(gameState);
      expect(gameState.turnCount).toBe(5);
      expect(gameState.gameOver).toBeTrue();
      expect(gameState.duelState[0].result).toBe("draw");
      expect(gameState.duelState[1].result).toBe("draw");
    });

    it("should end game if all units defeated", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      gameState.teams[1] = [];
      dummyAction(gameState);
      expect(gameState.gameOver).toBeTrue();
      expect(gameState.duelState[0].result).toBe("win");
      expect(gameState.duelState[1].result).toBe("lose");
    });

    it("should end game if someone surrenders", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      engine.surrender(gameState, 0);
      dummyAction(gameState);
      expect(gameState.gameOver).toBeTrue();
      expect(gameState.duelState[0].result).toBe("lose");
      expect(gameState.duelState[1].result).toBe("win");
    });

    it("should award 2 points for normal vs normal ko", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      expect(gameState.duelState[0].koScore).toBe(0);
      gameState.teams[0][1].pos = { x: 2, y: 5 };
      gameState.teams[1][1].pos = { x: 2, y: 4 };
      gameState.teams[1][1].stats.hp = 1;
      engine.executeAction(gameState, {
        from: { x: 2, y: 5 },
        to: { x: 2, y: 5 },
        target: { x: 2, y: 4 }
      });
      expect(gameState.duelState[0].koScore).toBe(2);
    });

    it("should award 3 points for captain vs normal ko", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      expect(gameState.duelState[0].koScore).toBe(0);
      gameState.teams[0][0].pos = { x: 2, y: 5 };
      gameState.teams[1][1].pos = { x: 2, y: 4 };
      gameState.teams[1][1].stats.hp = 1;
      gameState.teams[0][0].stats.atk += 10; // alfonse can't kill lol
      engine.executeAction(gameState, {
        from: { x: 2, y: 5 },
        to: { x: 2, y: 5 },
        target: { x: 2, y: 4 }
      });
      expect(gameState.duelState[0].koScore).toBe(3);
    });

    it("should award 3 points for normal vs captain ko", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      expect(gameState.duelState[0].koScore).toBe(0);
      gameState.teams[0][1].pos = { x: 2, y: 5 };
      gameState.teams[1][0].pos = { x: 2, y: 4 };
      gameState.teams[1][0].stats.hp = 1;
      engine.executeAction(gameState, {
        from: { x: 2, y: 5 },
        to: { x: 2, y: 5 },
        target: { x: 2, y: 4 }
      });
      expect(gameState.duelState[0].koScore).toBe(3);
    });

    it("should award 4 points for captain vs captain ko", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      expect(gameState.duelState[0].koScore).toBe(0);
      gameState.teams[0][0].pos = { x: 2, y: 5 };
      gameState.teams[1][0].pos = { x: 2, y: 4 };
      gameState.teams[1][0].stats.hp = 1;
      engine.executeAction(gameState, {
        from: { x: 2, y: 5 },
        to: { x: 2, y: 5 },
        target: { x: 2, y: 4 }
      });
      expect(gameState.duelState[0].koScore).toBe(4);
    });

    it("should award 2 points for having two more units inside the capture area", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      engine.endSwapPhase(gameState);
      gameState.teams[0][0].pos = { x: 2, y: 5 };
      gameState.teams[0][1].pos = { x: 2, y: 4 };
      engine.endTurn(gameState);
      engine.endTurn(gameState);
      expect(gameState.duelState[0].captureScore).toBe(2);
    });

    it("should update hash after performing an action", function () {
      const gameState = engine.newGame(map, team1, team2, "duel");
      const hash0 = gameState.hash;
      engine.endSwapPhase(gameState);
      const hash1 = gameState.hash;
      dummyAction(gameState);
      const hash2 = gameState.hash;
      engine.endTurn(gameState);
      const hash3 = gameState.hash;
      expect(hash0).not.toBe(hash1);
      expect(hash1).not.toBe(hash2);
      expect(hash2).not.toBe(hash3);
    });

    // it("should uncomment for benchmark", function () {
    //   team1[2].skills.push(SKILLS.REPOSITION.id);
    //   const gameState = engine.newGame(map, team1, team2, "duel");
    //   engine.endSwapPhase(gameState);
    //   const info = engine.search(gameState, 5);
    //   expect(1).toBe(1);
    // });

    // it("uncomment to revisit horizon issue", function () {
    //   const gameState = { "mode": "duel", "turnCount": 2, "currentTurn": 1, "isSwapPhase": false, "map": { "name": "SD7", "bg": "assets/maps/summonerduels/Map_ZR007.webp", "terrain": [[3, 3, 2, 2, 2, 0, 0, 0], [3, 3, 2, 0, 0, 0, 0, 0], [2, 2, 0, 0, 0, 0, 0, 0], [2, 0, 4, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 4, 0, 2], [0, 0, 0, 0, 0, 0, 2, 2], [0, 0, 0, 0, 0, 2, 3, 3], [0, 0, 0, 2, 2, 2, 3, 3]], "defensiveTerrain": [], "blocks": [{ "x": 3, "y": 4, "breakable": true, "hp": 2 }, { "x": 3, "y": 5, "breakable": true, "hp": 0 }, { "x": 4, "y": 4, "breakable": true, "hp": 2 }, { "x": 4, "y": 5, "breakable": true, "hp": 2 }], "startingPositions": [[{ "x": 0, "y": 7 }, { "x": 1, "y": 7 }, { "x": 1, "y": 8 }, { "x": 2, "y": 8 }, { "x": 2, "y": 9 }], [{ "x": 7, "y": 2 }, { "x": 6, "y": 2 }, { "x": 6, "y": 1 }, { "x": 5, "y": 1 }, { "x": 5, "y": 0 }]] }, "teams": [[{ "unitId": "NINO", "stats": { "maxHp": 35, "hp": 35, "atk": 50, "spd": 41, "def": 22, "res": 33 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 5, "current": 5 }, "skills": ["IRISS_TOME_REFINE_SPD", "RECIPROCAL_AID", "MIRACLE", "FURY_3", "DESPERATION_3", "SPD_SMOKE_3", "SWIFT_SPARROW_2_SEAL"], "buffs": { "atk": 5, "spd": 5, "def": 5, "res": 5 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 101, "team": 0, "pos": { "x": 1, "y": 5 } }, { "unitId": "AZURA", "stats": { "maxHp": 39, "hp": 39, "atk": 48, "spd": 36, "def": 24, "res": 31 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["SLAYING_SPEAR_PLUS_REFINE_EFF", "SING", "MOONBOW", "FURY_3", "WINGS_OF_MERCY_3", "DRIVE_ATK_2", "DRIVE_SPD_2_SEAL"], "buffs": { "atk": 5, "spd": 5, "def": 5, "res": 5 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": ["PANIC"], "hasAction": true, "combatsInPhase": 0, "id": 102, "team": 0, "pos": { "x": 1, "y": 6 } }, { "unitId": "FAE", "stats": { "maxHp": 49, "hp": 49, "atk": 52, "spd": 31, "def": 28, "res": 33 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["ETERNAL_BREATH_REFINE_EFF", "REPOSITION", "GLIMMER", "DISTANT_COUNTER", "VANTAGE_3", "DRIVE_ATK_2", "FURY_3_SEAL"], "buffs": { "atk": 5, "spd": 5, "def": 5, "res": 5 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 103, "team": 0, "pos": { "x": 2, "y": 6 } }, { "unitId": "EFFIE", "stats": { "maxHp": 53, "hp": 53, "atk": 56, "spd": 22, "def": 33, "res": 23 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 3, "current": 3 }, "skills": ["EFFIES_LANCE_REFINE_EFF", "DRAW_BACK", "BONFIRE", "ATK_DEF_BOND_3", "WINGS_OF_MERCY_3", "DRIVE_SPD_2", "ATK_RES_BOND_3_SEAL"], "buffs": { "atk": 5, "spd": 5, "def": 5, "res": 5 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 104, "team": 0, "pos": { "x": 3, "y": 6 } }, { "unitId": "PALLA", "stats": { "maxHp": 47, "hp": 47, "atk": 50, "spd": 34, "def": 35, "res": 29 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["WHITEWING_BLADE_REFINE_DEF", "REPOSITION", "MOONBOW", "FURY_3", "DULL_RANGED_3", "GUIDANCE_3", "ATK_SPD_BOND_3_SEAL"], "buffs": { "atk": 5, "spd": 5, "def": 5, "res": 5 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 105, "team": 0, "pos": { "x": 2, "y": 5 } }], [{ "unitId": "AZAMA", "stats": { "maxHp": 43, "hp": 43, "atk": 28, "spd": 26, "def": 37, "res": 35 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 5, "current": 5 }, "skills": ["PAIN_PLUS_REFINE_WRATHFUL", "MARTYR_PLUS", "MIRACLE", "FORTRESS_DEF_3", "DAZZLING_STAFF", "SAVAGE_BLOW_3", "SAVAGE_BLOW_3_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 201, "team": 1, "pos": { "x": 6, "y": 3 } }, { "unitId": "FAE", "stats": { "maxHp": 49, "hp": 49, "atk": 49, "spd": 28, "def": 25, "res": 30 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["ETERNAL_BREATH_REFINE_EFF", "DRAW_BACK", "GLIMMER", "CLOSE_DEF_3", "GUARD_3", "PANIC_PLOY_3", "QUICK_RIPOSTE_3_SEAL"], "buffs": { "atk": 5, "spd": 5, "def": 5, "res": 5 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 202, "team": 1, "pos": { "x": 6, "y": 6 } }, { "unitId": "GWENDOLYN", "stats": { "maxHp": 52, "hp": 52, "atk": 46, "spd": 24, "def": 38, "res": 28 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["WEIGHTED_LANCE_REFINE_EFF", "SWAP", "BONFIRE", "DISTANT_COUNTER", "QUICK_RIPOSTE_3", "WARD_ARMOUR", "STEADY_BREATH_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 203, "team": 1, "pos": { "x": 5, "y": 3 } }, { "unitId": "DRAUG", "stats": { "maxHp": 53, "hp": 53, "atk": 46, "spd": 32, "def": 39, "res": 18 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["STALWART_SWORD_REFINE_EFF", "SMITE", "MOONBOW", "ATK_SPD_BOND_3", "WINGS_OF_MERCY_3", "ARMOUR_MARCH", "ATK_SPD_BOND_3_SEAL"], "buffs": { "atk": 5, "spd": 5, "def": 5, "res": 5 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 204, "team": 1, "pos": { "x": 6, "y": 4 } }, { "unitId": "EFFIE", "stats": { "maxHp": 53, "hp": 53, "atk": 56, "spd": 22, "def": 33, "res": 23 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["EFFIES_LANCE_REFINE_EFF", "REPOSITION", "MOONBOW", "DISTANT_COUNTER", "VANTAGE_3", "WARD_ARMOUR", "DEATH_BLOW_3_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 205, "team": 1, "pos": { "x": 5, "y": 2 } }]], "history": [{ "unitId": 105, "type": "assist", "from": { "x": 2, "y": 9 }, "to": { "x": 2, "y": 7, "path": [{ "x": 2, "y": 9 }, { "x": 2, "y": 8 }, { "x": 2, "y": 7 }] }, "target": { "x": 2, "y": 8 } }, { "unitId": 205, "type": "assist", "from": { "x": 5, "y": 0 }, "to": { "x": 5, "y": 2, "path": [{ "x": 5, "y": 0 }, { "x": 5, "y": 1 }, { "x": 5, "y": 2 }] }, "target": { "x": 5, "y": 1 }, "score": 2000 }, { "unitId": 104, "type": "block", "from": { "x": 2, "y": 6 }, "to": { "x": 3, "y": 6, "path": [{ "x": 2, "y": 6 }, { "x": 3, "y": 6 }] }, "target": { "x": 3, "y": 5 } }, { "unitId": 203, "type": "assist", "from": { "x": 6, "y": 1 }, "to": { "x": 6, "y": 3, "path": [{ "x": 6, "y": 1 }, { "x": 6, "y": 2 }, { "x": 6, "y": 3 }] }, "target": { "x": 5, "y": 3 }, "score": 700 }, { "unitId": 101, "type": "block", "from": { "x": 0, "y": 7 }, "to": { "x": 2, "y": 6, "path": [] }, "target": { "x": 3, "y": 5 } }, { "unitId": 202, "type": "assist", "from": { "x": 6, "y": 2 }, "to": { "x": 6, "y": 4, "path": [{ "x": 6, "y": 2 }, { "x": 6, "y": 3 }, { "x": 6, "y": 4 }] }, "target": { "x": 6, "y": 3 }, "score": 2000 }, { "unitId": 102, "type": "assist", "from": { "x": 1, "y": 7 }, "to": { "x": 1, "y": 6, "path": [{ "x": 1, "y": 7 }, { "x": 1, "y": 6 }] }, "target": { "x": 2, "y": 6 } }, { "unitId": 201, "type": "move", "from": { "x": 7, "y": 2 }, "to": { "x": 6, "y": 3, "path": [{ "x": 7, "y": 2 }, { "x": 6, "y": 2 }, { "x": 6, "y": 3 }] }, "score": 2000 }, { "unitId": 101, "type": "move", "from": { "x": 2, "y": 6 }, "to": { "x": 1, "y": 5, "path": [{ "x": 2, "y": 6 }, { "x": 1, "y": 6 }, { "x": 1, "y": 5 }] } }, { "unitId": 204, "type": "assist", "from": { "x": 6, "y": 4 }, "to": { "x": 6, "y": 4, "path": [{ "x": 6, "y": 4 }] }, "target": { "x": 6, "y": 5 }, "score": 2000 }, "1 end turn", { "unitId": 103, "type": "assist", "from": { "x": 1, "y": 8 }, "to": { "x": 2, "y": 6, "path": [] }, "target": { "x": 2, "y": 7 } }, "0 end turn"], "gameOver": false, "duelState": [{ "captain": 101, "actionsRemaining": 6, "endedTurn": false, "surrendered": false, "koScore": 0, "captureScore": 0, "captainSkillRevealed": false }, { "captain": 201, "actionsRemaining": 6, "endedTurn": false, "surrendered": false, "koScore": 0, "captureScore": 0, "captainSkillRevealed": false }], "captureArea": { "x": 1, "y": 3, "w": 6, "h": 4 }, "lastStartingTeam": 1, "zobristTable": { "pos": { "101": [[-1028538813, 1514322719, -1458901905, 1684419500, -530565627, 850644981, 585367603, -22308606], [1022879527, -1032846610, -2020188936, -853138052, 951948984, -952163795, 1277747600, 1396963901], [-1399993377, -1422785116, -1688765305, -332170652, -326680389, -1768653677, 969150992, -884984397], [1933564488, -2035625965, 1237096103, -1234896525, 1783574, -1178515158, -1939609000, -734704820], [-691910238, 1630604665, 1398778870, 1644799014, -2027642016, 2052977220, 1186503054, -458810870], [-80910631, -1455699614, -756790199, 918912543, -1177353956, -404565660, 67141603, 1954503101], [1985082681, 1445517570, -333492410, -1157219811, -185523233, -1043310374, -1817490849, -1493847345], [86444473, 1712631185, -2022179838, 1711771481, 1786769743, 512931812, 1168927155, -606580162], [-496032559, -665455925, -1483171731, 641115847, -1356445264, -1541460552, 1957273836, 1446254198], [1268956523, -1644839188, 1865241848, 1945858561, -1429158052, -178825631, -319534036, -884069356]], "102": [[1806132806, 1788664785, -851875998, -613407096, 730325592, 777141886, 1512348848, -1936055], [-1742393236, -79871880, 897537473, 657186402, -1072582095, 1017465434, 673830157, 1132983657], [410285180, 1233379105, 2124096594, 1480344090, -543314299, 602558403, 676414346, 69234906], [1297976615, 1674901563, 1721805842, 393766371, 1665468449, -1972901599, -1623350656, 1188778486], [-1336576252, -938806370, 1499065570, -59355520, -2123571661, 1341972390, 1426670050, -611135368], [-1306524042, -281870559, -1442189814, 1859901486, -1373877535, -816885407, -1995499056, 747681162], [2115828698, -846125495, -1034310075, 95437869, -1417038761, 1030733846, 1758377632, 2101894157], [-1343149495, -574739019, 421050257, -222782236, -978951498, 937717646, -123461116, -529067338], [1176217446, 1813560765, 239807786, 371540861, 1997715288, 516772644, 563554160, 1784577100], [523106887, -1396472619, 1467979225, 492273755, 1187104853, -2036227664, -530094181, -1642841103]], "103": [[1765795133, 647393745, -47770265, -285954334, 506641846, 2031056884, 1774828940, -1854258000], [-463036282, 1052339997, 2013401264, 2023078650, 915848959, -933010117, 1010908281, 1644962398], [783957725, 1163192269, -335034245, -1273168609, 1549668544, 1451369347, 1287329210, -276556484], [-916990451, 1096521478, 1154651579, -623235159, 2059978750, 617736773, 716281769, 282315499], [1482513324, -1775016648, -1474783694, -520068867, 1323759666, -1376687998, -1664878926, -1599950664], [537081762, -1742876679, 498933256, 1912334326, -1381953548, 128545467, 373214916, 858558423], [-132224708, -1845000288, 1015377401, -1233835548, 2055055424, 566472890, -1387286192, 936771746], [260756259, -398613676, -692673889, 1582120525, -921226385, -1071489390, -168511958, 84488690], [1172008265, 641300336, 305729659, 922444896, 345924155, -1006951241, 1255208737, -760522149], [-2048707637, -1865293114, 1034446018, 389527322, -615777808, 718230154, -748705179, -462408468]], "104": [[1205358268, -1879908645, 1360842031, -543168749, 1288651533, 829889050, -1799499008, -177911378], [-700164282, -918840560, -244416068, 175846160, -281434468, -1498634679, 2127982619, -1435253167], [-2054689107, 1914446340, 1036549226, 2061601864, 645764732, 49698949, -180710730, 1256431872], [-424381887, 2003870175, 170229562, 494950075, -38756592, 604008217, 361244392, 1005643266], [-1054472486, 1045791396, 1311142180, -2141514363, -1080239376, -1130636623, 1047606199, 419178804], [646552825, -1212123086, -1610256783, -1264428524, 66820452, 1781727471, 1341283064, -1861857938], [1306494555, 529277681, -510383080, -420160397, -768943346, -1607521589, -340040080, 1776163978], [-475939827, 1344353725, -1539084234, -2098137196, 474647349, -391267901, -1389676759, -1307596018], [-1431871591, 1809824083, 38334985, -1657643603, 108710702, -1124355967, -1751463052, 276704718], [1832444557, 1548107033, -415183477, 549719187, -1952564424, -740641340, 690166229, 153749497]], "105": [[-626620612, 1113670044, 537682453, 630428274, -1402811876, 1359520012, -536252264, 223831349], [-540504979, 115581615, 611911028, -1641585409, 632228291, 1450834568, 1278283164, -573189891], [-1635639272, -1968740776, -1410926418, -359442377, -1289394339, -434642950, -1594183474, 713948255], [901975388, -646165912, 1444752496, -2114559335, -116789973, 1363050717, -1517885009, 1859488566], [702036239, -239075309, -913406286, 843155934, 1815299075, -1831342822, -2115514720, 2119017881], [-1792181210, 1872596786, 285221359, -1299929775, -469999994, 1840904336, 131197285, 1700255611], [1755868231, -1053334473, -1685860593, -1373234690, -836501198, -1907449773, 316228433, 1826406152], [-1668673450, 244899286, -1319043161, 2081609037, -237526000, -1344179718, -1172319307, 1296245665], [265678970, -1970767241, 1024608788, -28379204, 932551648, 433941268, 591796267, -399668918], [2040028360, 841866440, -1087890862, 808257539, -1266240971, 985942517, -861720312, -87986839]], "201": [[-80849404, 204935315, 713717665, -340601250, -1637936478, -43583417, 1873749872, -480069424], [996884332, -866863921, 56773769, 345667568, 384762498, 559383165, -232876847, 806369011], [-284688620, 206281638, -1730944231, 1923684705, 1629955523, 913335948, 1855881308, 1815166422], [988863091, 376176428, 1481062027, 1817752000, 913380080, -1848900601, 953251969, -269795519], [-2006469824, -1073871705, -1842235054, 107040831, -1598920820, 1681794061, -1219830254, 2107269782], [148894770, 1030728926, -696607708, 976881083, 723928925, -1703886373, -885489858, 1596716913], [427636211, 1202571346, 710317857, -287038344, 654915821, 42435591, -1293206140, 2116989449], [-1516731906, 21757581, -1378461248, -1155318697, 1234203235, -1134952403, 2007735874, -2011672045], [-920939266, -888492356, 1165941650, 1603913236, -1942633831, -1195774486, 630620776, 1319856165], [1448404914, -1628103037, -1719049679, 203653654, -263259930, -988297553, -2054868594, 1428744916]], "202": [[-1273114070, -984992314, -39078945, -237154089, 590625716, 739269429, -911476402, 1723966447], [87112849, 1992472000, 791550557, 1624490383, 78090814, 720011406, 630506387, 20369760], [-1203592883, 1628051576, 1654924858, 705573995, 2095638378, 1622637160, 1890717493, 465716351], [989607673, 944100840, -572160492, -910090137, 1416947361, -591692591, -686936735, 1189249584], [-1036671710, -1532357846, 1059367405, -381861695, 1703758387, 1437419158, 1385135369, 417460318], [-72464821, 1602273528, -1268546089, 1609986267, -1404445299, 1760655441, -1198256596, 325304836], [256738613, 1116447424, -324760439, -611856269, 280868439, 1754802412, -583640082, -549877333], [798018317, -388006187, -406947913, 5824883, -1834523064, -1281001825, -1280992092, 101878588], [-1177472954, 1692519146, -366468428, 564913387, -68950928, 1792466694, -1745800131, -1616847802], [19665938, -161272475, -365374270, -458031406, -696578138, 1181915201, -1171460740, -672356067]], "203": [[2134539838, 793341504, 1387040512, -1428243866, -807743153, 731090294, 496069992, 934468534], [-197028012, 332035105, -192861626, -386509086, 1735063831, 826843987, -2122782334, 358323046], [-2116321443, 673849573, -354391746, 523436413, -1668333421, -415350403, -852547499, 748033191], [777877350, -1769959170, 393397393, -1275547839, 1678038377, 731336093, -2034590353, 2012900196], [1749562319, -1475510729, -21485678, -1291400105, 990853937, 1363695013, 610784059, 504683355], [714032484, -2041009451, -213538348, -1986111605, 781046204, 66512833, 1054089350, -497254044], [1014445020, -1684503142, -296484369, -1554838085, -1637214743, 1177791426, 1513471623, 1364174549], [389044223, -1539794408, 1477211397, 53802035, 736495530, -1988430269, 568512218, 2131749382], [-877818111, 872404679, -306013996, 1709125816, -87434532, -203753291, 893539507, -2058002311], [34655828, 1620194457, -433982279, -831642462, 1438014015, 1086381479, 905319357, 129451997]], "204": [[1787359061, -1691555740, -1037236748, 820323101, 72376990, 142046591, 1036756083, 1643772657], [-1973861918, -289355056, 79893181, -1274757353, 1596953188, 17063541, -745383664, -1900200888], [263271058, 361736707, -113805596, -359375055, 1329315464, 633273693, -1195464009, -790105053], [-502013614, 1493936014, -1833672941, 865092792, 1542225499, 1355185480, 1921445151, 1266780973], [644275647, 1207347639, -892364233, 145078419, 1229516360, -994491128, 1863439236, -112304204], [1704991720, -1116194746, -194278722, 582126624, 367002331, -1563006778, -1776452863, 383103071], [-1156479440, -249546565, 819779488, -281586636, -1282733204, -1909120513, 1800424378, 650145673], [1293555761, -845424417, 1719898239, -2063385319, -1230871191, -1142442578, -417844249, -838907403], [-1124169419, -690232071, -489084229, 910460668, 1979605905, -2013235785, 1348701036, 13461131], [798605349, -466610549, 986593947, 1312173813, -151114975, 1087917932, 1871222070, -656203903]], "205": [[283483608, -930561385, -878930502, 2085936335, 510339593, 510444572, 1526753803, -1637546933], [-480043875, -1629429691, -538466543, 1270333683, -963027513, 1226252727, 152892359, 2078332629], [1181912904, -454355931, 1268684114, -1079500600, -846110960, 672737545, -1439040203, 645032122], [130464776, -659369653, -773164858, 1638045919, 1704284643, 982257879, -1437810916, -2008344405], [-2138034812, 556961172, 1619431252, -1662440542, -1976280340, 743608664, -1320394012, -1626377748], [1466689493, 1505431997, 1243161371, -1590365978, -634535630, 595441367, 558570628, 430702793], [-1357418893, 435997951, -1946061554, -155979874, -482169346, 1767138944, 1426660354, -1482322042], [-587345620, -1110169024, 723187662, -914183457, 133567187, 1881247909, 77014623, -339347375], [-852380426, -1908298495, -942387503, -1882754282, 1427503940, -1512881862, 1937186752, -2123749529], [1969066276, 676897176, -1323546099, 870527555, -523998634, -597881167, -857137420, 163923087]] }, "hp": { "101": [-681982670, 269364077, 2031114844, 958893393, -650417161, 1022389109, 38053114, 1302453623, -1209022352, -1831072000, 1958532446, 754231541, -2068884480, -1413283337, -1270708951, 2014493722, -575893102, -1136640515, -1006092222, 1275276802, 296494723, 988941213, 196304381, 1637184155, 923228792, 1430339548, 636114593, -1997117698, -1055319638, -1482244292, 2019681436, -625305019, -1213060804, -1608491338, -719314195, -19980237], "102": [875102148, 1373450156, 1899881144, 1614120365, -1064931251, -545966518, 1312102420, 1271250799, 2032373275, 352167691, -1551763547, 869907199, -1806872772, -1997476663, 945211869, -859720693, -1302721461, -1984028190, -37051581, -1644173870, 1240939376, 2109434812, 156276890, 1379492571, -1306165078, 1143535602, 379321, -1620340448, 1153210215, 475796911, 1137795515, -1826554040, 368123052, -84642722, -74563007, 1258885090, 878324120, 1548432556, 1628148131, 1958805436], "103": [-1084557606, -776567462, 581271380, 615974803, 1290417041, 1503317373, 110674311, -877792077, -766612498, -112776553, -1632807107, -1122546152, -833033678, -1328991203, 1595848760, -1960183116, 999600619, 412541151, 1429123513, -533965163, 891731626, -1131547213, 1162412398, -906327972, -2032779100, -1768022171, -81777060, 597586953, 1324675654, -952592104, 1466569141, -1093937029, 2102397369, -259660086, -942891932, -599327036, 1884397163, 805776133, 2039764854, -1675053141, -782218651, -575420397, 847328043, -2005962119, -1574155191, 1594510075, -588178447, 241713910, -1058620339, -91363142], "104": [1937072499, 876164382, 1103459891, 258004978, -1504888163, 583915602, -1590508911, -713238015, -1985511681, -1452468829, 1895266735, 1737990030, 413868573, -503369399, -49002782, -858800954, 1371229389, 1014819676, -2080390857, 16418747, 1370765341, 4594566, -1511097923, 837056241, 1484039404, 1372492184, -62366554, 206540360, 1297572331, -1943012706, 486303520, -1827517780, -1833118097, 106395831, -1049366793, 688440449, 42431981, 1801543152, 1529925247, 488566528, -551493473, -1521434170, 275525938, 1594030327, 60753881, -1881072885, 1015677995, -35381332, -1138379740, 1585913844, 307128392, 933788299, 668588055, -2017593030], "105": [988249407, 2102494335, -166326128, -1266329390, -327289667, 262522056, 1352725910, -1940897409, 193727296, -698218382, 2061761348, -1260107359, -2015453591, -698279840, 1489942550, 1984184816, 825386861, -970929726, 1007398798, 1991451923, 1345900411, 1931934096, 781114586, 1470540880, -943798906, -19969503, -421044892, -1540316191, -1177017561, 169911001, -787861148, 1945510935, 1508436493, -779852935, -528032756, 1542418543, 162797918, -647782863, -32045309, -1072011400, 308183362, -1934807207, 25519290, 257143891, 1122303839, 2096024280, 319363138, 808011778], "201": [1178309453, -1105787420, -1948320623, -573431721, -1564042277, 1174774693, -1135498947, -1481605818, -1425391606, -2106933137, -1769904420, -251509295, -1901029203, 688142751, 1758060036, 841451392, -1742423157, -437364735, -215776842, -507869252, -1729545126, 1395252875, 2011812887, -536262942, -763972728, -2064547605, 695494973, 774863252, -492750246, 2024181071, -1998094136, 1730751063, 236881830, 60863155, -1423060664, 832561290, 2086244333, -115003681, -1021119328, 728659227, 1550719069, 1943308815, -1338379291, 1189612583], "202": [455747386, -1503374500, -1376293317, 1177938499, -1798535075, -1121813122, -1556430024, -1863979946, -2138544447, 106929609, 1227989114, -622525883, 790527347, -156088245, 1222247766, 107539630, 1683557200, -480898839, 137308620, 1338161063, 1073560764, -1791270487, -658106130, 1621194083, -1884586299, -301338244, -722815857, -854187022, 610570118, 119094476, 815086860, 1906680918, 1623219937, 143992463, 618202381, -1955839727, 1786934902, -1378341296, -1437421191, 1942980519, -464494214, -409305627, -1393019082, -372939495, -374697238, -989205199, -313123418, -222588873, -1760248503, 386809847], "203": [114368283, -2088772158, 1613993345, 1123296448, 199964982, -176937648, 1243458143, 362744692, 1790988428, 2062416996, 1766671444, -113462697, -2118461332, -1939991593, -1967240091, 627798652, 800991790, -1249381069, 790078659, -1435170428, 1676937446, -1074787374, 1875314295, 1848778643, -1781709037, -1731720956, -1526727696, 733679664, 2115741998, 1827928721, 1738259297, 235270234, -1310956547, -1982302036, 1601520266, 329570840, -1810115829, 556647158, -1223358545, -335714369, -1503779974, 605756962, -1137654675, 856977491, 517477724, -1845430331, 334866073, 1140061258, -1842351081, -116823455, 1559144483, -1263233514, -390143859], "204": [-646929656, 1864824192, -2092137429, 1794397231, -297351433, -442529061, -1940326503, -942160052, -655015245, 1690322594, -292411992, -288954405, 1972258405, 354033732, 1933807981, 749210266, -1836003193, -1736348633, 363889157, -1141620899, -1074812142, 456393940, -294098589, -1982537239, -1462720323, 86121886, -1800526826, 1437944832, 2057105754, 1916805921, -1297924525, 2017470471, -715251129, 869241676, -177766273, -1469826133, -851916733, 1378289979, -754341925, 430682210, -1688260207, -792147001, -4838145, 2132012171, 1389573258, -1139819573, 631844976, 2000750019, -1462728225, -2071850902, 392615565, 2069535382, 687971538, 1239540351], "205": [-1949962107, -1887697009, -30283415, -1601817593, -1495660668, 595322545, -1441741433, -425695689, -1497951356, -600732409, 1606279727, -1661367885, 339203540, 1059516626, -961852980, 1573838501, 1163004072, -1935254549, -1128785722, 1270867414, 1470444756, -691419861, 603525565, 941136410, 1075984727, -434929485, 1455381905, 480690679, 1470084315, -2120511623, -18759901, -373469311, 1239726919, 251999265, -1717117759, 98919966, -1913183443, 1539591012, -2018286544, -1919376150, -1178655384, -11307071, -1530430060, 634314222, 806402103, -975225796, 1766657808, -582122585, -904662437, 1062094487, 67696249, 1111275610, 1942637281, 1750631146] }, "buffs": { "101": { "atk": [1138812855, -1110233156, -592234898, -173784719, -859723468, -989696729, -1670354956, -2125145645, 1471686756, 69510910, -1886290205, -1444211099, -1345180362], "spd": [285439573, -2030772335, -1109863598, 1373983211, -2132914969, 1628668038, 829049063, 1990463324, 515828635, -1166072355, -2041447073, -2034371102, 942970274], "def": [-1512469025, 405363246, 1593634968, -586019569, 180898198, 2091615499, -1923710258, -52238999, -1447904114, 978120831, 740592030, 536507829, 2027118451], "res": [-1446636382, 18759787, -344696670, 1818573522, -1395427603, -2083009878, 718555787, -752512407, 1282988413, -1111685098, -1958277271, 1072258492, -1618729485] }, "102": { "atk": [232656583, 1289228356, -1798942036, -1930673851, -1671919673, 413897591, 846038197, -577217336, 371740360, -505845968, 1792062543, -143383037, 87786745], "spd": [1871978609, -1730461124, -486247374, -574464877, 1548812507, -184450754, 1642976781, -1096750853, -733250140, -1006359749, 1829640906, 1689858497, 312942753], "def": [1037300148, 1062164614, 1605248905, -256274714, -305175340, 736717758, -716458287, -777608135, -1592700023, -412520167, -536673732, -1999437346, -168722198], "res": [334369166, -366537407, 426316230, 1365787054, 1927810304, 441360420, 118302497, -557052811, -1223493292, -281664440, 1549337463, -87265044, -286746108] }, "103": { "atk": [-1261705833, -950348597, 632504170, 160798437, -764705951, -487178718, -2088764453, -57663751, 380168862, 1956561667, 858774268, -965188028, -1666228068], "spd": [-1542717148, -1589971664, 201479486, -1844216852, 1353821755, -878089088, 555052060, 508321975, -653493542, -1665847343, 279805366, 1550329179, 1085165178], "def": [1634237635, -1326097189, 1990728940, -746493770, 744663133, 1414506953, -1885178062, -373217904, 1662297609, 224772483, 535109129, 950526843, 1574650623], "res": [727561227, 641746501, -6893279, -1813078792, 1313219776, -786574257, 420753701, 2032437533, -387744034, 1613288706, 731750534, 1848067904, 1595932871] }, "104": { "atk": [734923671, -1121925143, 509908455, 399622891, -568717171, 494645128, 2044322413, -149392313, -880641681, 291191864, -1386418794, 757631425, -1106882839], "spd": [55074919, -405504155, 1864729689, 712522318, -1962117610, -1139266863, -1861805968, 858591220, -928737987, 442507196, 728104343, 238168188, 747385250], "def": [1679382320, -1861125713, 2058588445, 446078965, -462638239, 840296001, 1432495311, 780290674, -1639249132, 437838976, -678158524, -605414854, -1929356308], "res": [-714914710, 2787645, 1890399963, 415105504, -926918271, -1107519655, -840713582, -326443382, 1546445255, -1030236051, 181858464, 1285440225, 478785664] }, "105": { "atk": [1007261270, -693536809, -232713154, -998329907, 1520698670, -1707397650, 257644429, -789418408, 974305348, -832841751, 545037050, -681808373, 154749925], "spd": [223681769, 2009766445, -1251334870, -937221011, 964367738, 559639184, -853484012, 178985413, 1541549196, -804793067, 2114545831, 816415753, 87828413], "def": [-915692039, 121649523, 228946372, -802807478, -1780350227, 1648971378, 996302225, 1792604889, -973085928, 167970070, 1050671238, -261369759, -962683118], "res": [1387087989, -1881235164, 616273913, -1630074949, -1171567157, -1579858878, 587013484, -1421548220, -899438350, 1355079372, -1464478974, 1214699368, -1007166579] }, "201": { "atk": [-1426768463, -1524598512, -364368335, 508479286, 330000418, -1420953131, -1700975058, -733560382, -2085717923, -669368337, 1662653340, 207218216, 587412134], "spd": [784309846, 1943842156, 676664532, -751147053, 1741082195, 2141019125, 1218322692, 460164155, -139325298, 31277503, -1799627766, 141039991, 1670997588], "def": [235039098, 646714732, 538355964, 1412210040, 938715545, 450213849, 704215054, -638593742, 1249449558, 2127537135, -587378570, -1467561233, 1253659202], "res": [-137911549, 2002753744, 217121970, -1601371487, 469597037, 646915461, -2050164774, 2109796961, 303077191, 536252507, 1916846597, 705345445, -482667878] }, "202": { "atk": [-823540113, 849375965, -1551738720, -94621301, -239036387, -1163532548, -919151135, 1137991716, 902823500, -1966411089, 1199564000, -946136271, 996130991], "spd": [1080202561, 1268594852, 2109706976, 1939273521, 57618601, 1245290644, -1152847967, 1897956127, 1227433086, -646150387, 2050849699, 2087244263, -1395369107], "def": [-1968487917, -1077100665, 800405689, -1662631448, -810149083, -1769663284, -1215474046, -1224860244, -599833047, -1414138156, -1199509501, 1989618467, -308487782], "res": [-267000408, -658981640, 735262219, -279158590, 197541216, 1093579253, 1964283357, 306710346, 1183354202, -1285603413, -1041970626, 1288170383, -2022458924] }, "203": { "atk": [-1589378662, 261977345, -2037238145, -874185615, -650887484, -2088851470, -1483126158, 1412525625, 1194863234, 258030966, 825412401, 1657748603, 759973307], "spd": [-1141876816, -1849136813, 10822498, 1038127558, -724532374, 1392904116, -303659060, -1627639517, 64222383, -712807540, -1498691243, 799953973, 1077400193], "def": [-339576863, 49359550, -746990387, -705722467, -2036689037, 1525199977, -1059849925, 1097047777, 1699434622, -405377956, 1642256178, 1536548016, -528893295], "res": [-1831204513, -1379003321, -2019639452, 1580268797, 1950415210, 115087196, 46333351, -206548836, -841374227, -706424129, -1177437786, 1380803668, 641433047] }, "204": { "atk": [-1066848856, 1582839686, 1303617938, 163469074, -1461903044, -1817292959, 302647872, 990273473, -281972610, -420787007, 1629078648, 1800142547, -2036135941], "spd": [-2104620061, 1035667802, -828603054, -1729387671, 2086129770, 1292843943, -452600358, -1989615067, 815963859, 207692431, 774505591, -1170294907, -183886430], "def": [1789061027, -58389112, -72335022, -2133136513, 1796624645, -2014506402, -1853959891, 540132480, 211342032, -828772463, -1642925404, -930364825, -1473791356], "res": [1727749761, -1471907180, -976499969, 773153301, -928488194, 1119918661, 1619673761, 856731406, -119606602, -141811790, -80292753, 383759090, -255961870] }, "205": { "atk": [2025464808, -1541370645, 33878165, 517623134, -1186629082, -701000218, -1243368509, -1327336498, 770563299, 1480625339, 1932444240, -939922526, -1422357916], "spd": [-20866990, 1957947479, 1050189291, -1986493351, -1151241520, 844345837, -911718246, -673583065, -763462167, -1515638264, -18248580, 597987887, -1916014273], "def": [-1324996084, -55208497, -1887040535, -1852137964, -1990715336, -1044676617, 1727222389, -1694273205, 1349029918, 252007499, 336541485, -1346853544, -647798031], "res": [1438906877, 1970658531, 333261175, 1754158030, -67103723, 785654228, -146808637, 1876373328, -845175922, 69308505, -209730868, 1877912767, -179002909] } }, "debuffs": { "101": { "atk": [-1528292980, 1559168608, 944232017, -1825507849, 1011594544, 392140934, 1839595137, -1664302885, -1641810768, -167077462, 46230933, -1056399444, -1923339118], "spd": [-90235742, 945902791, 1305348827, 507461297, -993350939, -1554937874, -433960648, 1336494586, -1269732207, -1582526864, 1009802849, -932129153, -2057618656], "def": [1956375373, 935049524, 1396586042, 718349318, -999454994, -490739082, -506096562, 953401824, 1561580407, -925287959, 325463419, 266495487, 686370417], "res": [2087929262, -1944619411, 965084928, -710505005, -2021583747, 81639866, -827250257, -1692618291, -1450705729, -1810448041, -876810647, -1739763855, 97354656] }, "102": { "atk": [-1053336757, 1637606116, -1523913497, -294131908, 1084072180, 1692896277, 969290311, 240426368, 561069362, -600263303, -1738115470, -2085897754, 1719203341], "spd": [550733048, 1507407646, -1738286877, -1937153316, -1165269995, 389270833, -1137797861, -1087010307, -816844296, 527286592, 1341673122, -2086036684, -1456953037], "def": [2021089692, 484334718, 1029737750, -1266076265, -716730934, -1155192555, -554220330, -69311520, -1007845871, -373135162, 1066020811, 874327218, -1595921769], "res": [1219198672, -916668312, 2070737088, 1273711930, 1808768924, -1615223870, -738659742, 2065810360, 696950899, -853858159, -1456648651, 496379456, -224880881] }, "103": { "atk": [1730658434, 2042735673, -996939430, -1901476538, 1982142086, 1246602108, 979784141, -73321054, 2142895656, 1340546262, 600004584, 1861229975, -988041738], "spd": [-1522035830, -1310066127, 1532211622, -2121562699, -694585269, -879528733, 82316004, -1289383938, 1502846195, 1806751573, 1511239928, -1382516418, -179477439], "def": [-2062303331, -1360839859, -119894392, -2004935763, 173755176, 82914391, 234897834, -1063955280, 711939985, -751801281, 138678244, -1095881672, 504046636], "res": [-1205787589, 141084520, 3943018, 727429778, -63807786, 1258283362, 1822636907, 1912966924, -1083821762, 1366851166, -2000571929, 1632853433, 1449877931] }, "104": { "atk": [-1934494332, -232047612, 551202033, -573408205, -657361351, 886836082, 67085515, 465490040, -142072672, -1869055762, 1865716396, 1363373980, -1431385788], "spd": [-38585538, -1068630828, -2059459361, 1429894573, 1786041642, -354171646, -634009533, 76456573, -924603971, 122764727, 1008629060, -1536651265, 125703092], "def": [1237385874, 1543355707, 1728072150, -1452447829, -1231509113, -693857741, -658974718, -1264041442, 564121867, -1402288556, 1621638276, -2144769000, 417522541], "res": [2041388108, -1632281954, -1992913459, 1232023754, 1102924113, -92586406, 733585602, -342094510, 754545001, 1482575971, -669855734, -1067028125, -955720058] }, "105": { "atk": [687506215, 1800778344, 2114764900, 638181348, -1554025762, -308928548, -472083030, 1549029086, 1685907257, -337422860, -1428111846, 425210347, -204565127], "spd": [-1195594664, -1950293341, 1694655561, 417415436, 685503724, -1634884049, 1665282667, -2065212052, -2045266967, 2101334108, 1639574278, -939939798, -1386136620], "def": [-1159307220, -1432833795, 744561022, -426441223, -2090149012, -655467889, 1682561360, -1289934143, -555401853, 1408844809, 343109397, 1269794941, -291417971], "res": [675978766, 182917803, -537116622, -1463856593, 497613074, 1407038135, 1424010802, 1711217281, 1397736214, -829946240, 89904172, -2079124573, 713593488] }, "201": { "atk": [-273821267, -426559679, -1893844740, 1211237244, 65891602, 1739570325, -1751628309, 2072487257, 1790647087, 838928320, 1306057020, -1995359709, 1694182441], "spd": [-1523843491, -2031495539, 993180337, -521061149, 717575669, -1895658296, 233313061, -31840125, -632867386, -1560109927, -492380431, 375696365, -532707775], "def": [2127914362, -1656994649, -1598201837, -1688219700, 912895359, 2064637724, -1654623702, -142242632, -2075698799, -2116252853, 101286193, -203882778, 1820513380], "res": [-1402611730, -979662622, 611993217, -102741420, -437030367, -44406598, -1175657700, -1805563205, 469200928, 1268634105, -973329368, 1331203732, -1882317839] }, "202": { "atk": [-1441931190, -695090616, 901878180, -111715938, 1593214252, 1144292005, 1483135541, -416755963, 667262017, 503102087, -551524879, -1605096450, -2141924341], "spd": [-796590447, -1517691270, 1452505721, 39097463, -1953349798, 1129690534, 1238328726, 181178920, -1984064532, 1136775052, 1010704404, -5710518, 1681098250], "def": [-1554252947, 1526668214, -2001278670, -410977094, -85961071, -159621240, -870233970, 1126185174, -1017019477, -1853334015, -750659707, -543233795, 1386774045], "res": [-110166032, -192054344, 615554789, -622293197, -1429185484, -1953980545, -1802577204, -1254565433, 1845638695, 807307972, -913918329, -174228308, 454223016] }, "203": { "atk": [446308230, 1949603155, 893502876, -1279643707, 1041492068, 553022603, 579114168, -1301947759, 801652554, 738983962, 769807805, -1913846537, -2096252018], "spd": [-157427214, -103523517, 624705981, 208851000, -1731552446, -1074074381, -1359690271, -11065755, 1760231080, -792509481, -1349939477, 1422858721, 1234215192], "def": [844779908, 1966562193, 1458315987, -2072192376, -90736930, -1646582792, -853525910, -2017364772, -2113851823, 1588554548, -890214192, 983887749, 1306008015], "res": [2042010615, -205357837, 937138557, -629703705, -1803834078, -635198355, 2070656122, -1317362808, 1149137069, -954816872, 1802518586, 227606945, -1727801069] }, "204": { "atk": [768675445, -1880447174, -1162650308, -208829578, 1066349159, -507777466, 303099807, -209582674, -708076907, 1975243513, -210086805, -2028602736, 817574099], "spd": [1634818397, 16863856, 1118289207, 355365207, -1147869579, -871305512, -390807139, 1617715742, 1775949097, 1552055894, 2052999602, -563228474, -355369604], "def": [-1315589409, -33262024, 1756005753, 951227931, 608806723, 77081971, 671084776, -440492231, -43178315, 1859053416, -161746599, -2039629503, 435535235], "res": [2116105634, 1245603048, 1388859545, 1135657588, 607362795, -1439402340, -1206159089, 812327122, -631760982, -855260036, -993678951, 1327537442, -870670496] }, "205": { "atk": [-185516898, -1086345009, 1843986396, 813407349, 1029090415, -206325694, 331577855, -479701087, -636227953, 1602646190, -1545374585, 1661089278, -1845427424], "spd": [-1905331735, 1512882624, -2138097270, -1871249163, 2103083233, -2054128126, -1068458390, -1608203484, 810270596, -1327982727, -456873438, 1100648098, 429266469], "def": [311530895, 606918271, 1652672718, 681346370, -1096273320, -1535038711, -1108953895, 80317831, -1705537445, 1673808597, -1186796326, 2146273398, 310988775], "res": [1282857911, 1996617431, 1925019002, 1582740755, -1771488183, -1914219623, -1793308109, -1759598626, 1062044588, 1748976176, -1890139252, -1278579713, 671408133] } }, "bonuses": { "101": { "MOBILITY_INCREASED": -2022522515 }, "102": { "MOBILITY_INCREASED": 763143494 }, "103": { "MOBILITY_INCREASED": -1858808113 }, "104": { "MOBILITY_INCREASED": -1531139451 }, "105": { "MOBILITY_INCREASED": 1826448095 }, "201": { "MOBILITY_INCREASED": 1175488994 }, "202": { "MOBILITY_INCREASED": -133789855 }, "203": { "MOBILITY_INCREASED": -1894913876 }, "204": { "MOBILITY_INCREASED": 1336545178 }, "205": { "MOBILITY_INCREASED": -400623907 } }, "penalties": { "101": { "GRAVITY": 42825468, "PANIC": 638138997, "COUNTERATTACKS_DISRUPTED": 699711510, "TRIANGLE_ADEPT": 884037250, "GUARD": -767414286 }, "102": { "GRAVITY": -279551661, "PANIC": 1291717965, "COUNTERATTACKS_DISRUPTED": 665130790, "TRIANGLE_ADEPT": -2091086804, "GUARD": 1241099584 }, "103": { "GRAVITY": 1906150404, "PANIC": -1010864822, "COUNTERATTACKS_DISRUPTED": -321818015, "TRIANGLE_ADEPT": 1984648217, "GUARD": -2050542115 }, "104": { "GRAVITY": 1205464490, "PANIC": 939426588, "COUNTERATTACKS_DISRUPTED": 339536530, "TRIANGLE_ADEPT": 208559123, "GUARD": 979903301 }, "105": { "GRAVITY": 596332893, "PANIC": 2109367341, "COUNTERATTACKS_DISRUPTED": 381962994, "TRIANGLE_ADEPT": -799723236, "GUARD": -1196962105 }, "201": { "GRAVITY": -625760119, "PANIC": 1542894680, "COUNTERATTACKS_DISRUPTED": 583806502, "TRIANGLE_ADEPT": -1297044236, "GUARD": 1122898691 }, "202": { "GRAVITY": -1216402933, "PANIC": 368181652, "COUNTERATTACKS_DISRUPTED": -304757260, "TRIANGLE_ADEPT": 901566868, "GUARD": 1581337651 }, "203": { "GRAVITY": -1508423581, "PANIC": -1401228754, "COUNTERATTACKS_DISRUPTED": -1244025583, "TRIANGLE_ADEPT": 1897285024, "GUARD": -1913735343 }, "204": { "GRAVITY": 1629701115, "PANIC": 584633845, "COUNTERATTACKS_DISRUPTED": 1470658694, "TRIANGLE_ADEPT": -982491530, "GUARD": 426662921 }, "205": { "GRAVITY": 881384167, "PANIC": -716075859, "COUNTERATTACKS_DISRUPTED": 2084570927, "TRIANGLE_ADEPT": -294847905, "GUARD": 1438874444 } }, "special": { "101": [1614225836, 72422925, -192672283, -768968615, 957108201], "102": [-161218968, -1133089441], "103": [216541187, 887214615], "104": [-32303899, 226438882, -53490477], "105": [1855897976, 1619877408], "201": [-1857561660, 768783803, 400091433, 1430537911, 1875134398], "202": [-1893339696, 1633773439], "203": [999547059, -1221472943], "204": [-1895679298, -1024865260], "205": [1878402361, -1049312591] }, "hasAction": { "101": -1361558095, "102": 1248527249, "103": -624583290, "104": -1344249511, "105": -1570649340, "201": 21164231, "202": -61172040, "203": 1575053724, "204": -1778219647, "205": 2105215520 }, "actionsRemaining": [[-1679850529, 523147181, 1992227136, -1689477909, 317647075, 832605274, 626021807], [-749606403, 598108042, 95605761, -1184257896, 53000709, -1721100783, -1364417691]], "endedTurn": [1741896308, 321584506], "currentTurn": -600376264, "turnCount": [1972257248, 201226265, 1532360327, 1428581605, -1880811592], "captureArea": [-1890441455, -1112294423, -1826705586, -1742812523, 1757744211, -526281100, -1618012381, -805143722, 1920592034, -1562612332], "blockHp": [[[1657003685, 1006188526, -1113860884, 667900559, 1598735552, -41278967, -2136013972, 2023019181], [-1158743443, -774996164, -619186904, -1813112367, 1247160027, 1596109373, 633849711, 2020406970], [835516679, 1936326737, 1600587201, 1145028590, -880187409, 166067957, 1901345000, 1064221260], [-322894401, 1118401284, -168728224, -1015929650, 2056306779, 837399510, -167939073, 735410686], [431622891, 1141872024, 1630180870, 1319350675, 715683515, -1415605244, 2063084011, -2022983895], [-1067675090, 288759650, -1986824209, 180219736, 1569696403, -1285439139, -503235592, 1790636455], [-1521518624, 1037636889, -264409564, -490611752, -287058011, 385812590, 162218359, 1362601749], [527460895, 1413735366, 794676411, 1335467038, -11132813, 1347675711, -1105846571, -1000569261], [-967880936, -634961650, 1926601133, -35327235, 349636384, 1918065177, 991863985, 513351125], [-1722299452, 1707082163, -616809912, -757622222, 329815482, 585462677, 510307870, 1048588938]], [[586986146, 565327414, -1980992500, -355270406, -750569956, 93517660, 877790944, -448157625], [-664097657, 850707770, -395946413, 1999161253, -1806280405, -1324235566, -1191427337, 620097126], [-1105543750, -602725140, -1453429301, -134166344, -1007731117, -1601387423, 941618241, 342808138], [441864761, -767697903, 1581699342, 142783645, -1674163915, -150424547, -790069288, 1031707249], [673636425, 1909944734, 1668592620, 1412424808, -1124387047, -1726433099, 1338649074, 1417280904], [315737580, 1743145882, 2083604176, -913901563, -968082554, 1722267672, -1523226230, 142711944], [1493213440, -382700144, 399330417, 1982519632, -1927727664, -541007839, -1151395421, 1426188118], [1418291139, 1985365147, 1717929177, 153664358, -691340092, -1558530611, 1103170716, 1778723349], [666229622, 129922683, -414143837, -1298315391, 1472216151, 1494514226, 471331451, -1454700105], [-943473495, -1165896510, -2094215922, 1261242696, -1434159862, -1602108392, -1738798279, 1046467364]], [[1129485849, 598107377, 137486029, 1323597849, 34710058, -53749504, 2056733781, -777550277], [226371563, -102185366, -980112904, 1172026381, 1478212000, -891655977, 2144742871, -135197503], [458111317, 1358273415, -1825848603, -2053473122, -1958909222, -358546231, -1925186699, 947726845], [890612956, -1857257477, -925825822, -505108412, -378645390, 1608562114, 1648557230, -2026673435], [-1483225710, -1148130816, 2093487208, -1226817014, 1787131418, 1283674905, -85168823, -1611945077], [-1178409466, 1162298471, 347742914, 1286282451, -920911317, 1651611239, 1192663321, 310645603], [-1914643977, 1293918616, -1665344306, -477694756, -1632624622, -856161237, 1137885365, 1665779639], [744376168, 1926894353, 666714861, 1945863869, 1722335819, -1563280805, 1454619255, 508828585], [956322329, 1529748664, -1885549468, -736580884, -370965618, -1411618905, -1036381613, -1904607477], [-2104508633, -670574638, 2102219564, 842018744, -819871941, -534951848, 1809577651, -1262609771]]] }, "hash": -59242075, "initialTeams": [[{ "unitId": "NINO", "stats": { "maxHp": 35, "hp": 35, "atk": 50, "spd": 41, "def": 22, "res": 33 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 5, "current": 5 }, "skills": ["IRISS_TOME_REFINE_SPD", "RECIPROCAL_AID", "MIRACLE", "FURY_3", "DESPERATION_3", "SPD_SMOKE_3", "SWIFT_SPARROW_2_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 101, "team": 0, "pos": { "x": 0, "y": 7 } }, { "unitId": "AZURA", "stats": { "maxHp": 39, "hp": 39, "atk": 48, "spd": 36, "def": 24, "res": 31 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["SLAYING_SPEAR_PLUS_REFINE_EFF", "SING", "MOONBOW", "FURY_3", "WINGS_OF_MERCY_3", "DRIVE_ATK_2", "DRIVE_SPD_2_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 102, "team": 0, "pos": { "x": 1, "y": 7 } }, { "unitId": "FAE", "stats": { "maxHp": 49, "hp": 49, "atk": 52, "spd": 31, "def": 28, "res": 33 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["ETERNAL_BREATH_REFINE_EFF", "REPOSITION", "GLIMMER", "DISTANT_COUNTER", "VANTAGE_3", "DRIVE_ATK_2", "FURY_3_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 103, "team": 0, "pos": { "x": 1, "y": 8 } }, { "unitId": "EFFIE", "stats": { "maxHp": 53, "hp": 53, "atk": 56, "spd": 22, "def": 33, "res": 23 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 3, "current": 3 }, "skills": ["EFFIES_LANCE_REFINE_EFF", "DRAW_BACK", "BONFIRE", "ATK_DEF_BOND_3", "WINGS_OF_MERCY_3", "DRIVE_SPD_2", "ATK_RES_BOND_3_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 104, "team": 0, "pos": { "x": 2, "y": 8 } }, { "unitId": "PALLA", "stats": { "maxHp": 47, "hp": 47, "atk": 50, "spd": 34, "def": 35, "res": 29 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["WHITEWING_BLADE_REFINE_DEF", "REPOSITION", "MOONBOW", "FURY_3", "DULL_RANGED_3", "GUIDANCE_3", "ATK_SPD_BOND_3_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 105, "team": 0, "pos": { "x": 2, "y": 9 } }], [{ "unitId": "AZAMA", "stats": { "maxHp": 43, "hp": 43, "atk": 28, "spd": 26, "def": 37, "res": 35 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 5, "current": 5 }, "skills": ["PAIN_PLUS_REFINE_WRATHFUL", "MARTYR_PLUS", "MIRACLE", "FORTRESS_DEF_3", "DAZZLING_STAFF", "SAVAGE_BLOW_3", "SAVAGE_BLOW_3_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 201, "team": 1, "pos": { "x": 7, "y": 2 } }, { "unitId": "FAE", "stats": { "maxHp": 49, "hp": 49, "atk": 49, "spd": 28, "def": 25, "res": 30 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["ETERNAL_BREATH_REFINE_EFF", "DRAW_BACK", "GLIMMER", "CLOSE_DEF_3", "GUARD_3", "PANIC_PLOY_3", "QUICK_RIPOSTE_3_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 202, "team": 1, "pos": { "x": 6, "y": 2 } }, { "unitId": "GWENDOLYN", "stats": { "maxHp": 52, "hp": 52, "atk": 46, "spd": 24, "def": 38, "res": 28 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["WEIGHTED_LANCE_REFINE_EFF", "SWAP", "BONFIRE", "DISTANT_COUNTER", "QUICK_RIPOSTE_3", "WARD_ARMOUR", "STEADY_BREATH_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 203, "team": 1, "pos": { "x": 6, "y": 1 } }, { "unitId": "DRAUG", "stats": { "maxHp": 53, "hp": 53, "atk": 46, "spd": 32, "def": 39, "res": 18 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["STALWART_SWORD_REFINE_EFF", "SMITE", "MOONBOW", "ATK_SPD_BOND_3", "WINGS_OF_MERCY_3", "ARMOUR_MARCH", "ATK_SPD_BOND_3_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 204, "team": 1, "pos": { "x": 5, "y": 1 } }, { "unitId": "EFFIE", "stats": { "maxHp": 53, "hp": 53, "atk": 56, "spd": 22, "def": 33, "res": 23 }, "phantomStats": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "special": { "max": 2, "current": 2 }, "skills": ["EFFIES_LANCE_REFINE_EFF", "REPOSITION", "MOONBOW", "DISTANT_COUNTER", "VANTAGE_3", "WARD_ARMOUR", "DEATH_BLOW_3_SEAL"], "buffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "debuffs": { "atk": 0, "spd": 0, "def": 0, "res": 0 }, "bonuses": [], "penalties": [], "hasAction": true, "combatsInPhase": 0, "id": 205, "team": 1, "pos": { "x": 5, "y": 0 } }]] }
    //   // engine.debug(gameState);
    //   // const info = engine.search(gameState, 4);
    //   const azamaMove = {
    //     "unitId": 201,
    //     "type": "block",
    //     "from": { "x": 6, "y": 3 },
    //     "to": {
    //       "x": 5,
    //       "y": 4,
    //       "path": [
    //         { "x": 6, "y": 3 },
    //         { "x": 5, "y": 3 },
    //         { "x": 5, "y": 4 }
    //       ]
    //     },
    //     "target": { "x": 3, "y": 4 }
    //   }
    //   engine.executeAction(gameState, azamaMove);
    //   const pallaMove = {
    //     "unitId": 105,
    //     "type": "block",
    //     "from": { "x": 2, "y": 5 },
    //     "to": {
    //       "x": 3,
    //       "y": 5,
    //       "path": [
    //         { "x": 2, "y": 5 },
    //         { "x": 3, "y": 5 }
    //       ]
    //     },
    //     "target": { "x": 3, "y": 4 }
    //   }
    //   engine.executeAction(gameState, pallaMove);
    //   engine.debug(gameState);
    //   const info = engine.search(gameState, 3);
    //   expect(1).toBe(1);
    // });

    // it("real game test", function () {
    //   team1 = [
    //     createBuild(UNIT.FAE.id, [SKILLS.ETERNAL_BREATH.id + "_REFINE_EFF", SKILLS.DRAW_BACK.id, SKILLS.GLIMMER.id, SKILLS.DISTANT_COUNTER.id, SKILLS.GUARD_3.id, SKILLS.PANIC_PLOY_3.id, SKILLS.QUICK_RIPOSTE_3.id]),
    //     createBuild(UNIT.ELIWOOD.id, [SKILLS.DURANDAL.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.GALEFORCE.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.GUARD_3.id, SKILLS.ATK_SMOKE_3.id, SKILLS.SWIFT_SPARROW_2.id]),
    //     createBuild(UNIT.ABEL.id, [SKILLS.BRAVE_LANCE_PLUS.id, SKILLS.REPOSITION.id, SKILLS.MOONBOW.id, SKILLS.DEATH_BLOW_3.id, SKILLS.HIT_AND_RUN.id, SKILLS.ATK_SMOKE_3.id, SKILLS.DEATH_BLOW_3.id]),
    //     createBuild(UNIT.CLARINE.id, [SKILLS.GRAVITY_PLUS.id + "_REFINE_WRATHFUL", SKILLS.PHYSIC_PLUS.id, SKILLS.MIRACLE.id, SKILLS.ATK_SPD_BOND_3.id, SKILLS.DAZZLING_STAFF.id, SKILLS.SAVAGE_BLOW_3.id, SKILLS.ATK_SPD_BOND_3.id]),
    //     createBuild(UNIT.CAEDA.id, [SKILLS.WING_SWORD.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.ICEBERG.id, SKILLS.FURY_3.id, SKILLS.HIT_AND_RUN.id, SKILLS.DRIVE_ATK_2.id, SKILLS.DRIVE_SPD_2.id])
    //   ];
    //   team2 = [
    //     createBuild(UNIT.CATRIA.id, [SKILLS.WHITEWING_LANCE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.MOONBOW.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.DRIVE_ATK_2.id]),
    //     createBuild(UNIT.OLIVIA.id, [SKILLS.SLAYING_EDGE_PLUS.id + "_REFINE_DEF", SKILLS.DANCE.id, SKILLS.MOONBOW.id, SKILLS.FURY_3.id, SKILLS.WINGS_OF_MERCY_3.id, SKILLS.DRIVE_DEF_2.id, SKILLS.DRIVE_RES_2.id]),
    //     createBuild(UNIT.EST.id, [SKILLS.WHITEWING_SPEAR.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.LUNA.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.GOAD_FLIERS.id, SKILLS.HONE_FLIERS.id]),
    //     createBuild(UNIT.CAMILLA.id, [SKILLS.CAMILLAS_AXE.id + "_REFINE_EFF", SKILLS.SWAP.id, SKILLS.MOONBOW.id, SKILLS.SWIFT_SPARROW_2.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.SWIFT_SPARROW_2.id]),
    //     createBuild(UNIT.PALLA.id, [SKILLS.WHITEWING_BLADE.id + "_REFINE_EFF", SKILLS.REPOSITION.id, SKILLS.LUNA.id, SKILLS.FURY_3.id, SKILLS.FLIER_FORMATION_3.id, SKILLS.WARD_FLIERS.id, SKILLS.FORTIFY_FLIERS.id])
    //   ];
    //   const gameState = engine.newGame(map, team1, team2, "duel");
    //   engine.swapStartingPositions(gameState, gameState.teams[0][0].pos, gameState.teams[0][2].pos);
    //   engine.endSwapPhase(gameState);
    //   let info;
    //   while (!gameState.gameOver) {
    //     if (info && info.score > 300) {
    //       break;
    //     }
    //     info = engine.search(gameState, 3);
    //     engine.executeAction(gameState, info.best);
    //   }
    //   engine.debug(gameState);

    //   expect(1).toBe(1);
    // });
  });
});
