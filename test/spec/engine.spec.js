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

  describe("Validation", function () {
    it("should not allow more than one weapon", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_SWORD_PLUS.id, SKILLS.BRAVE_SWORD_PLUS.id]);
      expect(engine.validateBuild(build)).toBeFalse();
    });

    it("should not allow weapon of different type", function () {
      const build = createBuild(UNIT.ALFONSE.id, [SKILLS.SILVER_LANCE_PLUS.id]);
      expect(engine.validateBuild(build)).toBeFalse();
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

    it("should not threaten breakble blocks with hp > 0", function () {
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
        blocks: [{ x: 2, y: 0, breakable: true, hp: 1 }],
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
