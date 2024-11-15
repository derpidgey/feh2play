import { ASSIST_TYPE, COLOUR, COMBAT_FLAG, CONDITION_OPERATOR, EFFECT_ACTION, EFFECT_CALCULATION, EFFECT_CONDITION, EFFECT_PHASE, EFFECT_TARGET, MOVE_TYPE, MOVEMENT_TYPE, MOVEMENT_FLAG, SKILL_TYPE, SPECIAL_TYPE, STATS, TERRAIN, WEAPON_TYPE, STAT_CHECK_TYPE, STATUS_TYPE } from "./data/definitions.js";
import SKILLS from "./data/skills.js";
import STATUS from "./data/status.js";
import UNIT from "./data/units.js";
import { deepClone } from "./utils.js";

function Engine() {
  const emptyStats = () => ({ atk: 0, spd: 0, def: 0, res: 0 });
  const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const getSkillInfo = (unit, skillType) => SKILLS[unit.skills.find(skill => SKILLS[skill].type === skillType)];
  const getWeaponInfo = unit => getSkillInfo(unit, SKILL_TYPE.WEAPON);
  const getAssistInfo = unit => getSkillInfo(unit, SKILL_TYPE.ASSIST);
  const getSpecialInfo = unit => getSkillInfo(unit, SKILL_TYPE.SPECIAL);
  const getWeaponType = unit => WEAPON_TYPE[UNIT[unit.unitId].weaponType];

  function validateBuild(build) {
    const unitInfo = UNIT[build.unitId];
    const counts = new Map(Object.values(SKILL_TYPE).map(type => [type, 0]));
    const skillMap = new Map();
    build.skills.forEach(skill => {
      const skillInfo = SKILLS[skill];
      const skillType = skillInfo.type;
      if (counts.has(skillType)) {
        counts.set(skillType, counts.get(skillType) + 1);
        skillMap.set(skillType, skillInfo);
      }
    });
    if (Array.from(counts.values()).some(count => count > 1)) return false;

    const weaponInfo = skillMap.get(SKILL_TYPE.WEAPON);
    if (weaponInfo) {
      if (weaponInfo.weaponType !== unitInfo.weaponType) return false;
    }

    // skill restrictions e.g. move type exclusive, weapon type exclusive
    // exclusive skills
    // in the future: rearmed and x
    return true;
  }

  function validateTeam(team) {
    // duplicate seals
    // team size
    // in the future: emblem rings

    // sd: no duplicate heroes, 1 save skill, 1 dance/sing skill
  }

  function newGame(map, team1Builds, team2Builds, mode = "regular") {
    const team1 = team1Builds.map(toGameUnit);
    const team2 = team2Builds.map(toGameUnit);

    team1.forEach((unit, i) => {
      unit.id = i + 101;
      unit.team = 0;
      unit.pos = { ...map.startingPositions[0][i] };
    });

    team2.forEach((unit, i) => {
      unit.id = i + 201;
      unit.team = 1;
      unit.pos = { ...map.startingPositions[1][i] };
    });

    const gameState = {
      mode,
      turnCount: 1,
      currentTurn: 0,
      isSwapPhase: true,
      map: deepClone(map),
      teams: [
        team1,
        team2
      ],
      history: [],
      gameOver: false
    };

    if (mode === "duel") {
      gameState.duelState = [
        createDuelState(team1),
        createDuelState(team2)
      ];
      gameState.captureArea = { x: 1, y: 3, w: 6, h: 4 };
      gameState.lastStartingTeam = 0; // Tracks which team started first last turn
      initZobristTable(gameState);
      initHash(gameState);
    }

    return gameState;
  }

  function toGameUnit(build) {
    const unitInfo = UNIT[build.unitId];
    const stats = calculateBaseStats(unitInfo, build.boon, build.bane, build.merges);
    const phantomStats = emptyStats();
    const specialInfo = getSpecialInfo(build);
    const special = {
      max: specialInfo?.cooldown ?? null,
      current: specialInfo?.cooldown ?? null
    };
    const context = { stats, phantomStats, special };

    const equipEffects = getEligibleEffects(EFFECT_PHASE.ON_EQUIP, build, context)
    processEffects(equipEffects, context);

    return {
      unitId: build.unitId,
      stats: { maxHp: stats.hp, ...stats },
      phantomStats,
      special,
      skills: [...build.skills],
      buffs: emptyStats(),
      debuffs: emptyStats(),
      bonuses: [],
      penalties: [],
      hasAction: true,
      combatsInPhase: 0
    };
  }

  function calculateBaseStats(unitInfo, boon, bane, merges) {
    let stats = { ...unitInfo.level40Stats };
    let level1Stats = { ...unitInfo.level1Stats };

    if (boon) {
      stats[boon] += (unitInfo.superboons.includes(boon)) ? 4 : 3;
      level1Stats[boon] += (unitInfo.superboons.includes(boon)) ? 4 : 3;
    }
    if (bane && merges === 0) {
      stats[bane] -= (unitInfo.superbanes.includes(bane)) ? 4 : 3;
      level1Stats[bane] -= (unitInfo.superbanes.includes(bane)) ? 4 : 3;
    }
    const sortedStats = [
      { name: 'hp', value: level1Stats.hp },
      { name: 'atk', value: level1Stats.atk },
      { name: 'spd', value: level1Stats.spd },
      { name: 'def', value: level1Stats.def },
      { name: 'res', value: level1Stats.res }
    ].sort((a, b) => b.value - a.value);
    for (let i = 1, offset = 0; i <= merges; i++, offset++) {
      if (i === 1 && !bane) {
        stats[sortedStats[0].name] += 1;
        stats[sortedStats[1].name] += 1;
        stats[sortedStats[2].name] += 1;
      }
      stats[sortedStats[(i + offset - 1) % 5].name] += 1;
      stats[sortedStats[(i + offset) % 5].name] += 1;
    }
    return stats;
  }

  function createDuelState(team) {
    return {
      captain: team[0].id,
      actionsRemaining: 6,
      endedTurn: false,
      surrendered: false,
      koScore: 0,
      captureScore: 0,
      captainSkillRevealed: false
    }
  }

  function initZobristTable(gameState) {
    let seed = 1804289383;
    const r32 = () => {
      let number = seed;
      number ^= number << 13;
      number ^= number >> 17;
      number ^= number << 5;
      seed = number;
      return number;
    }

    gameState.zobristTable = {
      pos: {},
      hp: {},
      buffs: {},
      debuffs: {},
      bonuses: {},
      penalties: {},
      special: {},
      hasAction: {},
      actionsRemaining: [[], []],
      endedTurn: [r32(), r32()],
      currentTurn: r32(),
      turnCount: [r32(), r32(), r32(), r32(), r32()]
      // todo one for capture area
      // combats in phase <- probably not needed
    }

    const rows = gameState.map.terrain.length;
    const cols = gameState.map.terrain[0].length;
    for (const unit of gameState.teams[0].concat(gameState.teams[1])) {
      gameState.zobristTable.pos[unit.id] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => r32()));
      gameState.zobristTable.hp[unit.id] = Array(unit.stats.maxHp + 1).fill(0).map(() => r32());
      gameState.zobristTable.buffs[unit.id] = {};
      gameState.zobristTable.debuffs[unit.id] = {};
      for (const stat of [STATS.ATK, STATS.SPD, STATS.DEF, STATS.RES]) {
        gameState.zobristTable.buffs[unit.id][stat] = Array(13).fill(0).map(() => r32());
        gameState.zobristTable.debuffs[unit.id][stat] = Array(13).fill(0).map(() => r32());
      }
      gameState.zobristTable.bonuses[unit.id] = {};
      gameState.zobristTable.penalties[unit.id] = {};
      for (const status of Object.values(STATUS)) {
        if (status.type === STATUS_TYPE.POSITIVE) {
          gameState.zobristTable.bonuses[unit.id][status.id] = r32();
        } else {
          gameState.zobristTable.penalties[unit.id][status.id] = r32();
        }
      }
      gameState.zobristTable.special[unit.id] = Array(unit.special.max ?? 0 + 1).fill(0).map(() => r32());
      gameState.zobristTable.hasAction[unit.id] = r32();
    }
    gameState.zobristTable.actionsRemaining[0] = Array(7).fill(0).map(() => r32());
    gameState.zobristTable.actionsRemaining[1] = Array(7).fill(0).map(() => r32());
  }

  function hashPos(gameState, unit) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.pos[unit.id][unit.pos.x][unit.pos.y];
  }

  function hashHp(gameState, unit) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.hp[unit.id][unit.stats.hp];
  }

  function hashSpecial(gameState, unit) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.special[unit.id][unit.special.current];
  }

  function hashHasAction(gameState, unit) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.hasAction[unit.id];
  }

  function hashBuff(gameState, unit, stat) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.buffs[unit.id][stat][unit.buffs[stat]];
  }

  function hashDebuff(gameState, unit, stat) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.debuffs[unit.id][stat][unit.debuffs[stat]];
  }

  function hashBonus(gameState, unit, bonus) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.bonuses[unit.id][bonus];
  }

  function hashPenalty(gameState, unit, penalty) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.penalties[unit.id][penalty];
  }

  function hashActionsRemaining(gameState, team) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.actionsRemaining[team][gameState.duelState[team].actionsRemaining];
  }

  function hashCurrentTurn(gameState) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.currentTurn;
  }

  function hashEndedTurn(gameState, team) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.endedTurn[team];
  }

  function hashTurnCount(gameState) {
    if (gameState.mode !== "duel") return;
    gameState.hash ^= gameState.zobristTable.turnCount[gameState.turnCount - 1];
  }

  function initHash(gameState) {
    gameState.hash = 0;
    for (const unit of gameState.teams[0].concat(gameState.teams[1])) {
      hashPos(gameState, unit);
      hashHp(gameState, unit);
      hashSpecial(gameState, unit);
      hashHasAction(gameState, unit);
      for (const stat of [STATS.ATK, STATS.SPD, STATS.DEF, STATS.RES]) {
        hashBuff(gameState, unit, stat);
        hashDebuff(gameState, unit, stat);
      }
    }
    hashActionsRemaining(gameState, 0);
    hashActionsRemaining(gameState, 1);
    hashTurnCount(gameState);
  }

  function debug(gameState) {
    const { teams, currentTurn, turnCount, map } = gameState;
    let buffer = `\nTurn: ${turnCount}\nCurrent Player: Team ${currentTurn}\n`;
    buffer += displayMap(map, teams);

    teams.forEach((team, index) => {
      buffer += `\n--- Team ${index} ---\n`;
      if (gameState.mode === "duel") {
        const duelState = gameState.duelState[index];
        buffer += `Actions: ${duelState.actionsRemaining}, KO Score: ${duelState.koScore}, Capture Score: ${duelState.captureScore}\n`;
      }
      team.forEach(unit => {
        const unitInfo = UNIT[unit.unitId];
        buffer += `${unitInfo.name} ${unit.stats.hp}/${unit.stats.maxHp} | ${unit.stats.atk} | ${unit.stats.spd} | ${unit.stats.def} | ${unit.stats.res} Special: ${unit.special.current}/${unit.special.max}\n`;
        buffer += `\tBuffs: ${unit.buffs.atk} | ${unit.buffs.spd} | ${unit.buffs.def} | ${unit.buffs.res} Debuffs: ${unit.debuffs.atk} | ${unit.debuffs.spd} | ${unit.debuffs.def} | ${unit.debuffs.res}\n`;
        buffer += `\tPosition: (${unit.pos.x}, ${unit.pos.y})\tHas Action: ${unit.hasAction ? 'Yes' : 'No'}\n`;
        buffer += `\tSkills: ${unit.skills.join(', ')}\n`;
        buffer += `\tStatus: ${unit.bonuses.concat(unit.penalties).join(', ')}\n`;
      });
    });

    console.log(buffer);
  }

  function displayMap(map, teams) {
    const mapArray = Array.from({ length: map.terrain.length }, () =>
      Array.from({ length: map.terrain[0].length }, () => '.')
    );
    map.terrain.forEach((col, y) => {
      col.forEach((terrain, x) => {
        if (terrain === TERRAIN.FOREST) mapArray[y][x] = "T";
        else if (terrain === TERRAIN.FLIER) mapArray[y][x] = "^";
        else if (terrain === TERRAIN.WALL) mapArray[y][x] = "█";
        else if (terrain === TERRAIN.TRENCH) mapArray[y][x] = "_";
      });
    });
    teams.forEach((team, teamIndex) => {
      team.forEach(unit => mapArray[unit.pos.y][unit.pos.x] = teamIndex);
    });
    map.blocks.forEach(block => {
      if (!block.breakable || block.hp > 0) {
        mapArray[block.y][block.x] = "B";
      }
    });
    return mapArray.reduce((prev, cur) => prev + cur.join(" ") + "\n", "");
  }

  function calculateMovementRange(gameState, unit, filterOccupiedSpaces = true) {
    const unitInfo = UNIT[unit.unitId];
    const tiles = gameState.map.terrain;
    const blocks = gameState.map.blocks;

    const movementFlags = {
      warpableTiles: [],
      obstructedTiles: []
    };
    const context = { gameState, movingUnit: unit, movementFlags };
    const movementEffects = [];
    movementEffects.push(...getEligibleEffects(EFFECT_PHASE.CALCULATE_OWN_MOVEMENT, unit, context));
    gameState.teams[unit.team]
      .filter(ally => ally.id !== unit.id)
      .forEach(unit => movementEffects.push(...getEligibleEffects(EFFECT_PHASE.CALCULATE_ALLY_MOVEMENT, unit, context)));
    gameState.teams[unit.team ^ 1]
      .forEach(unit => movementEffects.push(...getEligibleEffects(EFFECT_PHASE.CALCULATE_ENEMY_MOVEMENT, unit, context)));
    processEffects(movementEffects, context);

    const range = movementFlags[MOVEMENT_FLAG.RESTRICT_MOVEMENT] ? 1 : MOVE_TYPE[unitInfo.moveType].range + (movementFlags.extraSpaces ?? 0);
    const destinations = [];
    const queue = [{ ...unit.pos, remainingRange: range, path: [] }];
    const visited = {};

    while (queue.length > 0) {
      const { x, y, remainingRange, path } = queue.shift();
      if (!onMap(gameState.map, { x, y })) continue;

      const terrain = tiles[y][x];
      let nextRange = remainingRange;

      if (unitInfo.moveType === MOVE_TYPE.INFANTRY.id) {
        if (terrain === TERRAIN.WALL || terrain === TERRAIN.FLIER) continue;
        if (terrain === TERRAIN.FOREST && !(x === unit.pos.x && y === unit.pos.y)) nextRange -= 1;
      } else if (unitInfo.moveType === MOVE_TYPE.CAVALRY.id) {
        if (terrain === TERRAIN.FOREST || terrain === TERRAIN.WALL || terrain === TERRAIN.FLIER) continue;
        if (terrain === TERRAIN.TRENCH && !(x === unit.pos.x && y === unit.pos.y)) nextRange -= 2;
      } else if (unitInfo.moveType === MOVE_TYPE.FLIER.id) {
        if (terrain === TERRAIN.WALL) continue;
      } else if (unitInfo.moveType === MOVE_TYPE.ARMOURED.id) {
        if (terrain === TERRAIN.WALL || terrain === TERRAIN.FLIER) continue;
      }
      if (nextRange < 0) continue;

      const block = blocks.find(b => b.x === x && b.y === y);
      if (block && (!block.breakable || block.hp > 0)) continue;

      if (!movementFlags[MOVEMENT_FLAG.PASS]) {
        const occupiedByOtherTeam = gameState.teams[unit.team ^ 1].some(u => u.pos.x === x && u.pos.y === y);
        if (occupiedByOtherTeam) {
          continue;
        }
      }

      const newPath = [...path, { x, y }];
      const key = `${x},${y}`;

      if (visited[key] !== undefined && visited[key] >= nextRange) {
        continue;
      }
      visited[key] = nextRange;

      if (!destinations.some(tile => tile.x === x && tile.y === y)) {
        destinations.push({ x, y, path: newPath });
      }

      if (!movementFlags[MOVEMENT_FLAG.PASS]) {
        if (!(unit.pos.x === x && unit.pos.y === y) && movementFlags.obstructedTiles.some(tile => tile.x === x && tile.y === y)) {
          continue;
        }
      }

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (Math.abs(dx) + Math.abs(dy) === 1) {
            queue.push({ x: x + dx, y: y + dy, remainingRange: nextRange - 1, path: newPath });
          }
        }
      }
    }

    movementFlags.warpableTiles.forEach(warpTile => {
      if (!destinations.some(tile => tile.x === warpTile.x && tile.y === warpTile.y)) {
        destinations.push({ x: warpTile.x, y: warpTile.y, path: [] });
      }
    });
    if (filterOccupiedSpaces) {
      const allOtherUnits = gameState.teams[0].concat(gameState.teams[1]).filter(u => u.id !== unit.id);
      return destinations.filter(tile => allOtherUnits.every(u => u.pos.x !== tile.x || u.pos.y !== tile.y));
    }
    return destinations;
  }

  function calculateThreatRange(gameState, unit, filterOccupiedSpaces = true) {
    const weapon = getWeaponInfo(unit);
    if (!weapon) return [];
    const attackRange = weapon.range;
    const movementRange = calculateMovementRange(gameState, unit, filterOccupiedSpaces);
    const attackableTiles = new Map();

    movementRange.forEach(({ x, y }) => {
      for (let dx = -attackRange; dx <= attackRange; dx++) {
        for (let dy = -attackRange; dy <= attackRange; dy++) {
          const distance = Math.abs(dx) + Math.abs(dy);
          if (distance !== attackRange) continue;
          const targetPosition = {
            x: x + dx,
            y: y + dy
          };
          const key = `${targetPosition.x},${targetPosition.y}`;
          if (attackableTiles.has(key)) continue;
          if (onMap(gameState.map, targetPosition)) {
            if (gameState.map.terrain[targetPosition.y][targetPosition.x] === TERRAIN.WALL) continue;
            const block = gameState.map.blocks.find(b => b.x === targetPosition.x && b.y === targetPosition.y);
            if (block && (!block.breakable || block.hp > 0)) continue;
            attackableTiles.set(key, targetPosition);
          }
        }
      }
    });
    return Array.from(attackableTiles.values());
  }

  function generateActions(gameState, unit) {
    if (!unit.hasAction) return [];
    const actions = [];
    calculateMovementRange(gameState, unit).forEach(tile => {
      actions.push({
        type: "move",
        from: { ...unit.pos },
        to: { ...tile }
      });
      generateAttackActions(gameState, unit, tile, actions);
      generateAssistActions(gameState, unit, tile, actions);
      generateBlockActions(gameState, unit, tile, actions);
    });
    return actions;
  }

  function generateAttackActions(gameState, unit, tile, actions) {
    const weapon = getWeaponInfo(unit);
    if (!weapon) return;
    gameState.teams[unit.team ^ 1].forEach(enemy => {
      if (manhattan(tile, enemy.pos) === weapon.range) {
        actions.push({
          type: "attack",
          from: { ...unit.pos },
          to: { ...tile },
          target: { ...enemy.pos }
        });
      }
    });
  }

  function generateBlockActions(gameState, unit, tile, actions) {
    const weapon = getWeaponInfo(unit);
    if (!weapon) return;
    gameState.map.blocks.forEach(block => {
      if (manhattan(tile, block) === weapon.range && block.breakable && block.hp > 0) {
        actions.push({
          type: "block",
          from: { ...unit.pos },
          to: { ...tile },
          target: { x: block.x, y: block.y }
        });
      }
    });
  }

  function generateAssistActions(gameState, unit, tile, actions) {
    const assist = getAssistInfo(unit);
    if (!assist) return;
    gameState.teams[unit.team].forEach(ally => {
      if (unit === ally) return;
      if (manhattan(tile, ally.pos) !== assist.range) return;
      if (assist.assistType === ASSIST_TYPE.MOVEMENT) {
        const { unitDestination, targetDestination } = calculateMovementTypeDestinations(gameState, tile, ally, assist.movementAssist);
        if (!validateMovementTypeDestinations(gameState, unit, unitDestination, ally, targetDestination, assist.movementAssist)) return;
      } else if (assist.assistType === ASSIST_TYPE.REFRESH) {
        if (ally.hasAction || ally.skills.some(skill => SKILLS[skill].assistType === ASSIST_TYPE.REFRESH)) return;
      } else if (assist.assistType === ASSIST_TYPE.HEAL) {
        if (ally.stats.hp === ally.stats.maxHp) return;
      } else if (assist.assistType === ASSIST_TYPE.RALLY) {
        const unableToRally = assist.rallyBuffs.every(buff => ally.buffs[buff.stat] >= buff.value);
        if (unableToRally) return;
      } else if (assist.assistType === ASSIST_TYPE.SACRIFICE) {
        if (ally.stats.hp === ally.stats.maxHp || unit.stats.hp <= assist.amount) return;
      } else if (assist.assistType === ASSIST_TYPE.RECIPROCAL_AID) {
        const unitPotentialGain = Math.min(ally.stats.hp, unit.stats.maxHp) - unit.stats.hp;
        const allyPotentialGain = Math.min(unit.stats.hp, ally.stats.maxHp) - ally.stats.hp;
        if (unitPotentialGain <= 0 && allyPotentialGain <= 0) return;
      } else if (assist.assistType === ASSIST_TYPE.HARSH_COMMAND) {
        if (ally.debuffs.atk === 0 && ally.debuffs.spd === 0 && ally.debuffs.def === 0 && ally.debuffs.res === 0) return;
      }
      actions.push({
        type: "assist",
        from: { ...unit.pos },
        to: { ...tile },
        target: { ...ally.pos }
      })
    });
  }

  function generateKoActions(gameState, unit) { // todo make sure capture
    if (!unit.hasAction) return [];
    const actions = [];
    calculateMovementRange(gameState, unit).forEach(tile => {
      generateAttackActions(gameState, unit, tile, actions);
    });
    return actions;
  }

  function calculateMovementTypeDestinations(gameState, unitpos, targetUnit, movementType) {
    switch (movementType) {
      case MOVEMENT_TYPE.SWAP:
        return {
          unitDestination: targetUnit.pos,
          targetDestination: unitpos
        }
      case MOVEMENT_TYPE.SMITE:
        const intermediateTile = {
          x: 2 * targetUnit.pos.x - unitpos.x,
          y: 2 * targetUnit.pos.y - unitpos.y
        };
        const target = {
          x: 3 * targetUnit.pos.x - 2 * unitpos.x,
          y: 3 * targetUnit.pos.y - 2 * unitpos.y
        }
        if (onMap(gameState.map, intermediateTile) && gameState.map.terrain[intermediateTile.y][intermediateTile.x] !== TERRAIN.WALL) {
          const block = gameState.map.blocks[intermediateTile.y][intermediateTile.x];
          if (!block || block.hp === 0) {
            if (canLandOn(UNIT[targetUnit.unitId].moveType, gameState.map, target) && !occupiedByAnyUnit(gameState, target)) {
              return {
                unitDestination: unitpos,
                targetDestination: target
              }
            }
          }
        }
      case MOVEMENT_TYPE.SHOVE:
        return {
          unitDestination: unitpos,
          targetDestination: {
            x: 2 * targetUnit.pos.x - unitpos.x,
            y: 2 * targetUnit.pos.y - unitpos.y
          }
        }
      case MOVEMENT_TYPE.DRAW_BACK:
        return {
          unitDestination: {
            x: 2 * unitpos.x - targetUnit.pos.x,
            y: 2 * unitpos.y - targetUnit.pos.y
          },
          targetDestination: unitpos
        }
      case MOVEMENT_TYPE.HIT_AND_RUN:
        return {
          unitDestination: {
            x: 2 * unitpos.x - targetUnit.pos.x,
            y: 2 * unitpos.y - targetUnit.pos.y
          },
          targetDestination: targetUnit.pos
        }
      case MOVEMENT_TYPE.REPOSITION:
        return {
          unitDestination: unitpos,
          targetDestination: {
            x: 2 * unitpos.x - targetUnit.pos.x,
            y: 2 * unitpos.y - targetUnit.pos.y
          }
        }
      case MOVEMENT_TYPE.PIVOT:
        return {
          unitDestination: {
            x: 2 * targetUnit.pos.x - unitpos.x,
            y: 2 * targetUnit.pos.y - unitpos.y
          },
          targetDestination: targetUnit.pos
        }
      default:
        console.warn(`Unknown movement assist ${movementType}`);
        return { unitDestination: { x: -1, y: -1 }, targetDestination: { x: -1, y: -1 } }
    }
  }

  function validateMovementTypeDestinations(gameState, unit, unitDestination, target, targetDestination, movementType) {
    const unitMoveType = UNIT[unit.unitId].moveType;
    // hack to lunge / drag back dead foes
    const targetMoveType = target.stats.hp > 0 ? UNIT[target.unitId].moveType : MOVE_TYPE.FLIER.id;
    if (!canLandOn(unitMoveType, gameState.map, unitDestination) || !canLandOn(targetMoveType, gameState.map, targetDestination)) return false;
    switch (movementType) {
      case MOVEMENT_TYPE.SWAP:
        return true;
      case MOVEMENT_TYPE.SHOVE:
      case MOVEMENT_TYPE.SMITE:
      case MOVEMENT_TYPE.REPOSITION:
        return !occupiedByAnyUnit(gameState, targetDestination, [unit.id]);
      case MOVEMENT_TYPE.DRAW_BACK:
      case MOVEMENT_TYPE.PIVOT:
      case MOVEMENT_TYPE.HIT_AND_RUN:
        return !occupiedByAnyUnit(gameState, unitDestination, [unit.id]);
      default:
        console.warn(`Unknown movement assist ${movementType}`);
        return false;
    }
  }

  function canLandOn(moveType, map, { x, y }) {
    if (!onMap(map, { x, y })) return;
    const terrain = map.terrain[y][x];
    if (terrain === TERRAIN.WALL) return false;
    if ((moveType === MOVE_TYPE.INFANTRY.id || moveType === MOVE_TYPE.ARMOURED) && terrain === TERRAIN.FLIER) return false;
    if (moveType === MOVE_TYPE.CAVALRY.id && (terrain === TERRAIN.FOREST || terrain === TERRAIN.FLIER)) return false;

    const block = map.blocks.find(b => b.x === x && b.y === y);
    if (block && (!block.breakable || block.hp > 0)) return false;

    return true;
  }

  function occupiedByAnyUnit(gameState, { x, y }, except = []) {
    return gameState.teams[0].concat(gameState.teams[1])
      .some(u => !except.includes(u.id) && u.pos.x === x && u.pos.y === y);
  }

  function onMap(map, { x, y }) {
    return x >= 0 && y >= 0 && y < map.terrain.length && x < map.terrain[0].length;
  }

  function isValidAction(gameState, action) {
    if (action.type === "end turn") return true;
    const unit = gameState.teams[0].concat(gameState.teams[1])
      .find(u => u.pos.x === action.from.x && u.pos.y === action.from.y);
    if (!unit || unit.team !== gameState.currentTurn) return false;
    const validActions = generateActions(gameState, unit);
    return validActions.some(validAction => actionEquals(validAction, action));
  }

  function actionEquals(a, b) {
    if (!a || !b) return false;
    return a.from?.x === b.from?.x && a.from?.y === b.from?.y
      && a.to?.x === b.to?.x && a.to?.y === b.to?.y
      && a.target?.x === b.target?.x && a.target?.y === b.target?.y
  }

  function executeAction(gameState, action) {
    if (action.type === "end turn") {
      endTurn(gameState);
      return;
    }
    gameState.history.push(action);
    const unit = gameState.teams[0].concat(gameState.teams[1])
      .find(u => u.pos.x === action.from.x && u.pos.y === action.from.y);
    // const unitInfo = UNIT[unit.unitId];
    hashPos(gameState, unit);
    unit.pos = { ...action.to };
    unit.hasAction = false;
    hashHasAction(gameState, unit);
    // console.log(`${unitInfo.name} moved from (${action.from.x}, ${action.from.y}) to (${action.to.x}, ${action.to.y})`);
    if (action.target) {
      const block = gameState.map.blocks.find(b => b.x === action.target.x && b.y === action.target.y);
      if (block) {
        block.hp -= 1;
      } else {
        const targetUnit = gameState.teams[0].concat(gameState.teams[1])
          .find(u => u.pos.x === action.target.x && u.pos.y === action.target.y);
        // const targetInfo = UNIT[targetUnit.unitId];
        // console.log(`${unitInfo.name} targeted ${targetInfo.name} at (${action.target.x}, ${action.target.y})`);
        if (unit.team === targetUnit.team) {
          performAssist(gameState, unit, targetUnit);
        } else {
          const results = calculateCombatResult(gameState, unit, targetUnit);
          unit.combatsInPhase += 1;
          targetUnit.combatsInPhase += 1;
          hashHp(gameState, unit);
          unit.stats.hp = results.units[0].stats.hp;
          hashHp(gameState, unit);
          hashSpecial(gameState, unit);
          unit.special.current = results.units[0].special.current;
          hashSpecial(gameState, unit);
          hashHp(gameState, targetUnit);
          targetUnit.stats.hp = results.units[1].stats.hp;
          hashHp(gameState, targetUnit);
          hashSpecial(gameState, targetUnit);
          targetUnit.special.current = results.units[1].special.current;
          hashSpecial(gameState, targetUnit);
          results.sequence.filter(seq => seq.aoe).forEach(seq => {
            if (seq.defender === targetUnit.id) return;
            const aoeVictim = gameState.teams[targetUnit.team].find(victim => victim.id === seq.defender);
            hashHp(gameState, aoeVictim);
            aoeVictim.stats.hp = Math.max(1, aoeVictim.stats.hp - seq.damage);
            hashHp(gameState, aoeVictim);
          });
          const context = { results, gameState };

          const afterCombatBeforeDeathEffects = [];
          afterCombatBeforeDeathEffects.push(...getEligibleEffects(EFFECT_PHASE.AFTER_COMBAT_BEFORE_DEATH, unit, context));
          afterCombatBeforeDeathEffects.push(...getEligibleEffects(EFFECT_PHASE.AFTER_COMBAT_BEFORE_DEATH, targetUnit, context));
          processEffects(afterCombatBeforeDeathEffects, context);

          handleDeaths(gameState, unit, targetUnit);

          const afterCombatEffects = [];
          if (unit.stats.hp > 0) {
            afterCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.AFTER_COMBAT, unit, context));
          }
          if (targetUnit.stats.hp > 0) {
            afterCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.AFTER_COMBAT, targetUnit, context));
          }
          gameState.teams[unit.team]
            .filter(u => u.id !== unit.id)
            .forEach(u => afterCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.AFTER_ALLY_COMBAT, u, context)));
          gameState.teams[targetUnit.team]
            .filter(u => u.id !== targetUnit.id)
            .forEach(u => afterCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.AFTER_ALLY_COMBAT, u, context)));
          processEffects(afterCombatEffects, context);

          const afterCombatDisplacementEffects = [];
          afterCombatDisplacementEffects.push(...getEligibleEffects(EFFECT_PHASE.AFTER_COMBAT_DISPLACEMENT, unit, context));
          afterCombatDisplacementEffects.push(...getEligibleEffects(EFFECT_PHASE.AFTER_COMBAT_DISPLACEMENT, targetUnit, context));
          processEffects(afterCombatDisplacementEffects, context);

          const unitSpecial = getSpecialInfo(unit);
          const unitSpecialTriggered = unitSpecial?.specialType === SPECIAL_TYPE.GALEFORCE && unit.special.current === 0 && !unit.hasAction;
          if (unitSpecialTriggered) {
            unit.hasAction = true;
            hashHasAction(gameState, unit);
          }
        }
      }
    }
    for (const stat of [STATS.ATK, STATS.SPD, STATS.DEF, STATS.RES]) {
      hashDebuff(gameState, unit, stat);
      unit.buffs[stat] = 0;
      hashDebuff(gameState, unit, stat);
    }
    unit.penalties.forEach(penalty => hashPenalty(gameState, unit, penalty));
    unit.penalties = [];
    hashPos(gameState, unit);
    checkAutoEndTurn(gameState);
    checkGameOver(gameState);
  }

  function performAssist(gameState, unit, targetUnit) {
    const assist = getAssistInfo(unit);
    const unitContext = { gameState, assistTarget: targetUnit };
    const targetContext = { gameState, assistUser: unit };
    if (assist.assistType === ASSIST_TYPE.MOVEMENT) {
      hashPos(gameState, targetUnit);
      const { unitDestination, targetDestination } = calculateMovementTypeDestinations(gameState, unit.pos, targetUnit, assist.movementAssist);
      unit.pos = unitDestination;
      targetUnit.pos = targetDestination;
      hashPos(gameState, targetUnit);
      const movementEffects = getEligibleEffects(EFFECT_PHASE.USED_MOVEMENT_ASSIST, unit, unitContext);
      processEffects(movementEffects, unitContext);
      const targetedByMovementEffects = getEligibleEffects(EFFECT_PHASE.TARGETTED_BY_MOVEMENT_ASSIST, unit, targetContext);
      processEffects(targetedByMovementEffects, unitContext);
    } else if (assist.assistType === ASSIST_TYPE.REFRESH) {
      targetUnit.hasAction = true;
      hashHasAction(gameState, targetUnit);
      const danceEffects = getEligibleEffects(EFFECT_PHASE.USED_DANCE, unit, unitContext);
      processEffects(danceEffects, unitContext);
    } else if (assist.assistType === ASSIST_TYPE.HEAL) {
      hashHp(gameState, targetUnit);
      const healAmount = calculateHealAmount(unit, targetUnit, assist.heal);
      const finalHp = Math.min(targetUnit.stats.maxHp, targetUnit.stats.hp + healAmount);
      const actualHealed = finalHp - targetUnit.stats.hp;
      targetUnit.stats.hp = finalHp;
      hashHp(gameState, targetUnit);
      // console.log(`${unit.unitId} heals ${targetUnit.unitId} for ${actualHealed} HP.`);
      if (assist.selfHeal) {
        hashHp(gameState, unit);
        const selfHealAmount = calculateHealAmount(unit, unit, assist.selfHeal);
        const finalSelfHp = Math.min(unit.stats.maxHp, unit.stats.hp + selfHealAmount);
        const actualSelfHealed = finalSelfHp - unit.stats.hp;
        unit.stats.hp = finalSelfHp;
        hashHp(gameState, unit);
        // console.log(`${unit.unitId} self-heals for ${actualSelfHealed} HP.`);
      }
      unitContext.hpRestored = actualHealed;
      const healEffects = getEligibleEffects(EFFECT_PHASE.USED_HEAL, unit, unitContext);
      processEffects(healEffects, unitContext);
      const special = getSpecialInfo(unit);
      if (special) {
        if (special.specialType === SPECIAL_TYPE.HEALING && unit.special.current === 0) {
          const healingSpecialEffects = getEligibleEffects(EFFECT_PHASE.ON_HEALING_SPECIAL_TRIGGER, unit, unitContext);
          processEffects(healingSpecialEffects, unitContext);
          hashSpecial(gameState, unit);
          unit.special.current = unit.special.max;
          hashSpecial(gameState, unit);
        } else {
          hashSpecial(gameState, unit);
          unit.special.current = Math.max(unit.special.current - 1, 0);
          hashSpecial(gameState, unit);
        }
      }
    } else if (assist.assistType === ASSIST_TYPE.RALLY) {
      // might move rallyBuffs into USED_RALLY_ASSIST effects
      assist.rallyBuffs.forEach(buff => targetUnit.buffs[buff.stat] = Math.max(targetUnit.buffs[buff.stat], buff.value));
      const rallyEffects = getEligibleEffects(EFFECT_PHASE.USED_RALLY_ASSIST, unit, unitContext);
      processEffects(rallyEffects, unitContext);
      const targetedByRallyEffects = getEligibleEffects(EFFECT_PHASE.TARGETTED_BY_RALLY_ASSIST, unit, targetContext);
      processEffects(targetedByRallyEffects, unitContext);
    } else if (assist.assistType === ASSIST_TYPE.SACRIFICE) {
      const amount = assist.amount ?? Math.min(unit.stats.hp - 1, targetUnit.stats.maxHp - targetUnit.stats.hp);
      hashHp(gameState, targetUnit);
      targetUnit.stats.hp = Math.min(targetUnit.stats.maxHp, targetUnit.stats.hp + amount);
      hashHp(gameState, targetUnit);
      hashHp(gameState, unit);
      unit.stats.hp -= amount;
      hashHp(gameState, unit);
    } else if (assist.assistType === ASSIST_TYPE.RECIPROCAL_AID) {
      const unitHp = unit.stats.hp;
      const targetHp = targetUnit.stats.hp;
      hashHp(gameState, unit);
      unit.stats.hp = Math.min(targetHp, unit.stats.maxHp);
      hashHp(gameState, unit);
      hashHp(gameState, targetUnit);
      targetUnit.stats.hp = Math.min(unitHp, targetUnit.stats.maxHp);
      hashHp(gameState, targetUnit);
    } else if (assist.assistType === ASSIST_TYPE.HARSH_COMMAND) {
      Object.keys(targetUnit.debuffs).forEach(stat => {
        const penaltyValue = targetUnit.debuffs[stat];
        if (penaltyValue > 0) {
          targetUnit.buffs[stat] = Math.max(targetUnit.buffs[stat], penaltyValue);
          targetUnit.debuffs[stat] = 0;
        }
      });
    }
  }

  function calculateHealAmount(unit, targetUnit, healInfo) {
    let healAmount = 0;

    healInfo.calculations.forEach(calc => {
      switch (calc.type) {
        case EFFECT_CALCULATION.PERCENT_OF_STAT:
          healAmount += Math.floor((unit.stats[calc.stat] * calc.percent) / 100);
          break;
        case EFFECT_CALCULATION.VALUE:
          healAmount += calc.value;
          break;
        case EFFECT_CALCULATION.MISSING_HP:
          healAmount += Math.floor((targetUnit.stats.maxHp - targetUnit.stats.hp) * calc.percent / 100);
          break;
        case EFFECT_CALCULATION.LOW_HP_BOOST:
          healAmount += Math.max(0, targetUnit.stats.maxHp - 2 * targetUnit.stats.hp);
          break;
        default:
          console.warn(`Unknown calculation type ${calc.type} for healing.`);
      }
    });

    return Math.max(healAmount, healInfo.min || 0);
  }

  function handleDeaths(gameState, unit, targetUnit) {
    if (gameState.mode === "duel") {
      let koScore = 2;
      if (unit.id === gameState.duelState[unit.team].captain) koScore += 1;
      if (targetUnit.id === gameState.duelState[targetUnit.team].captain) koScore += 1;
      if (unit.stats.hp <= 0) {
        gameState.duelState[targetUnit.team].koScore += koScore;
      }
      if (targetUnit.stats.hp <= 0) {
        gameState.duelState[unit.team].koScore += koScore;
      }
    }
    // todo death hash
    gameState.teams[0] = gameState.teams[0].filter(u => u.stats.hp > 0);
    gameState.teams[1] = gameState.teams[1].filter(u => u.stats.hp > 0);
  }

  function swapStartingPositions(gameState, posA, posB) {
    if (!gameState.isSwapPhase) return;
    const teamIndexA = gameState.map.startingPositions
      .findIndex(team => team.some(startPos => startPos.x === posA.x && startPos.y === posA.y));
    const teamIndexB = gameState.map.startingPositions
      .findIndex(team => team.some(startPos => startPos.x === posB.x && startPos.y === posB.y));
    if (teamIndexA === -1 || teamIndexB === -1 || teamIndexA !== teamIndexB) return;
    const unitAtPosA = gameState.teams[teamIndexA].find(unit => unit.pos.x === posA.x && unit.pos.y === posA.y);
    const unitAtPosB = gameState.teams[teamIndexA].find(unit => unit.pos.x === posB.x && unit.pos.y === posB.y);
    if (unitAtPosA && unitAtPosB) {
      hashPos(gameState, unitAtPosA);
      hashPos(gameState, unitAtPosB);
      [unitAtPosA.pos, unitAtPosB.pos] = [unitAtPosB.pos, unitAtPosA.pos];
      hashPos(gameState, unitAtPosA);
      hashPos(gameState, unitAtPosB);
    } else if (unitAtPosA) {
      hashPos(gameState, unitAtPosA);
      unitAtPosA.pos = { x: posB.x, y: posB.y };
      hashPos(gameState, unitAtPosA);
    } else if (unitAtPosB) {
      hashPos(gameState, unitAtPosB);
      unitAtPosB.pos = { x: posA.x, y: posA.y };
      hashPos(gameState, unitAtPosB);
    }
  }

  function checkAutoEndTurn(gameState) {
    if (gameState.mode === "duel") {
      const currentDuelState = gameState.duelState[gameState.currentTurn];
      const foeDuelState = gameState.duelState[gameState.currentTurn ^ 1];
      hashActionsRemaining(gameState, gameState.currentTurn);
      currentDuelState.actionsRemaining -= 1;
      hashActionsRemaining(gameState, gameState.currentTurn);
      const currentTeam = gameState.teams[gameState.currentTurn];
      if (currentTeam.every(unit => !unit.hasAction) || currentDuelState.actionsRemaining === 0) {
        endTurn(gameState);
      } else if (!foeDuelState.endedTurn) {
        gameState.currentTurn ^= 1;
        hashCurrentTurn(gameState);
      }
      return;
    }
    const currentTeam = gameState.teams[gameState.currentTurn];
    if (currentTeam.every(unit => !unit.hasAction)) {
      endTurn(gameState);
    }
  }

  function distanceFromCaptureArea(gameState, pos) {
    const { captureArea } = gameState;
    if (
      pos.x >= captureArea.x &&
      pos.x < captureArea.x + captureArea.w &&
      pos.y >= captureArea.y &&
      pos.y < captureArea.y + captureArea.h
    ) {
      return 0;
    }
    const xDistance = Math.max(0, captureArea.x - pos.x, pos.x - (captureArea.x + captureArea.w - 1));
    const yDistance = Math.max(0, captureArea.y - pos.y, pos.y - (captureArea.y + captureArea.h - 1));
    return xDistance + yDistance;
  }

  function endTurn(gameState) {
    if (gameState.mode === "duel") {
      gameState.history.push(`${gameState.currentTurn} end turn`);
      gameState.duelState[gameState.currentTurn].endedTurn = true;
      hashEndedTurn(gameState, gameState.currentTurn);
      gameState.teams[gameState.currentTurn].forEach(unit => {
        if (unit.hasAction) {
          hashHasAction(gameState, unit);
          unit.hasAction = false;
        }
      });
      if (gameState.duelState.every(x => x.endedTurn)) {
        const team1UnitsInArea = gameState.teams[0].filter(unit => distanceFromCaptureArea(gameState, unit.pos) === 0).length;
        const team2UnitsInArea = gameState.teams[1].filter(unit => distanceFromCaptureArea(gameState, unit.pos) === 0).length;
        if (team1UnitsInArea >= team2UnitsInArea + 2) {
          gameState.duelState[0].captureScore += 2;
        } else if (team2UnitsInArea >= team1UnitsInArea + 2) {
          gameState.duelState[1].captureScore += 2;
        }
        if (gameState.turnCount === 5) {
          gameState.gameOver = true;
          const team1Score = gameState.duelState[0].koScore + gameState.duelState[0].captureScore;
          const team2Score = gameState.duelState[1].koScore + gameState.duelState[1].captureScore;
          if (team1Score > team2Score) {
            gameState.duelState[0].result = "win";
            gameState.duelState[1].result = "lose";
          } else if (team2Score > team1Score) {
            gameState.duelState[1].result = "win";
            gameState.duelState[0].result = "lose";
          } else {
            gameState.duelState[1].result = "draw";
            gameState.duelState[0].result = "draw";
          }
          return;
        }
        hashTurnCount(gameState);
        gameState.turnCount += 1;
        hashTurnCount(gameState);
        handleStartOfDuelTurn(gameState);
      } else {
        gameState.currentTurn ^= 1;
        hashCurrentTurn(gameState);
      }
      return;
    }
    gameState.history.push("end turn");
    gameState.teams[gameState.currentTurn].forEach(unit => {
      if (!unit.hasAction) {
        hashHasAction(gameState, unit);
        unit.hasAction = true;
      }
    });
    gameState.currentTurn ^= 1;
    if (gameState.currentTurn === 0) {
      gameState.turnCount += 1;
    }
    handleStartOfRegularTurn(gameState);
  }

  function surrender(gameState, team) {
    gameState.gameOver = true;
    if (gameState.mode === "duel") {
      gameState.duelState[team].result = "lose";
      gameState.duelState[team ^ 1].result = "win";
    }
  }

  function checkGameOver(gameState) {
    gameState.teams.forEach((team, i) => {
      if (team.length === 0) {
        gameState.gameOver = true;
        if (gameState.mode === "duel") {
          gameState.duelState[i].result = "lose";
          gameState.duelState[i ^ 1].result = "win";
        }
      }
    });
  }

  function enterSwapPhase(gameState) {
    if (gameState.isSwapPhase || gameState.mode === "duel") return;
    gameState.isSwapPhase = true;
    gameState.teams = gameState.initialTeams;
  }

  function endSwapPhase(gameState) {
    if (!gameState.isSwapPhase) return;
    gameState.isSwapPhase = false;
    gameState.initialTeams = deepClone(gameState.teams);
    if (gameState.mode === "duel") {
      handleStartOfDuelTurn(gameState);
    } else {
      handleStartOfRegularTurn(gameState);
    }
  }

  function handleStartOfDuelTurn(gameState) {
    if (gameState.duelState[0].actionsRemaining > gameState.duelState[1].actionsRemaining) {
      gameState.currentTurn = 0;
    } else if (gameState.duelState[1].actionsRemaining > gameState.duelState[0].actionsRemaining) {
      gameState.currentTurn = 1;
    } else {
      gameState.currentTurn = gameState.lastStartingTeam;
    }
    if (gameState.lastStartingTeam !== gameState.currentTurn) {
      hashCurrentTurn(gameState);
    }
    gameState.lastStartingTeam = gameState.currentTurn;
    gameState.duelState.forEach((duelState, i) => {
      if (duelState.endedTurn) {
        duelState.endedTurn = false;
        hashEndedTurn(gameState, i);
      }
      hashActionsRemaining(gameState, i);
      duelState.actionsRemaining = 6;
      hashActionsRemaining(gameState, i);
    });
    gameState.teams[0].concat(gameState.teams[1]).forEach(unit => {
      for (const stat of [STATS.ATK, STATS.SPD, STATS.DEF, STATS.RES]) {
        hashBuff(gameState, unit, stat);
        unit.buffs[stat] = 0;
        hashBuff(gameState, unit, stat);
      }
      unit.bonuses.forEach(bonus => hashBonus(gameState, unit, bonus));
      unit.bonuses = [];
      if (!unit.hasAction) {
        hashHasAction(gameState, unit);
        unit.hasAction = true;
      }
      unit.combatsInPhase = 0;
    });
    const context = { gameState };
    const startOfTurnEffects = [];
    gameState.teams[gameState.currentTurn]
      .forEach(unit => startOfTurnEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_TURN, unit, context)));
    gameState.teams[gameState.currentTurn ^ 1]
      .forEach(unit => startOfTurnEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_TURN, unit, context)));
    gameState.teams[gameState.currentTurn]
      .forEach(unit => startOfTurnEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_ENEMY_PHASE, unit, context)));
    gameState.teams[gameState.currentTurn ^ 1]
      .forEach(unit => startOfTurnEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_ENEMY_PHASE, unit, context)));
    gameState.teams[0].concat(gameState.teams[1])
      .forEach(unit => startOfTurnEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_PLAYER_PHASE_OR_ENEMY_PHASE, unit, context)));
    processEffects(startOfTurnEffects, context);
  }

  function handleStartOfRegularTurn(gameState) {
    gameState.teams[0].concat(gameState.teams[1]).forEach(unit => {
      unit.buffs = emptyStats();
      unit.bonuses = [];
      unit.combatsInPhase = 0;
    });
    const context = { gameState };
    const startOfTurnEffects = [];
    gameState.teams[gameState.currentTurn]
      .forEach(unit => startOfTurnEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_TURN, unit, context)));
    gameState.teams[gameState.currentTurn ^ 1]
      .forEach(unit => startOfTurnEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_ENEMY_PHASE, unit, context)));
    gameState.teams[0].concat(gameState.teams[1])
      .forEach(unit => startOfTurnEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_PLAYER_PHASE_OR_ENEMY_PHASE, unit, context)));
    processEffects(startOfTurnEffects, context);
  }

  function calculateCombatResult(gameState, initiator, defender) {
    const results = {
      units: [
        toCombatUnit(initiator, true, gameState),
        toCombatUnit(defender, false, gameState)
      ],
      combatState: {
        nextAttacker: 0,
        complete: false
      },
      sequence: []
    };
    const context = { results, gameState };

    const beforeCombatEffects = [];
    beforeCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.BEFORE_COMBAT, results.units[0], context));
    beforeCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.BEFORE_COMBAT, results.units[1], context));
    processEffects(beforeCombatEffects, context);

    const initiatorSpecial = getSpecialInfo(results.units[0]);
    if (initiatorSpecial?.specialType === SPECIAL_TYPE.AOE && results.units[0].special.current === 0) {
      const specialFlags = {
        situationalFixedDamage: 0
      };
      const aoeContext = { results, gameState, specialFlags };
      const onSpecialEffects = getEligibleEffects(EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER, results.units[0], aoeContext);
      processEffects(onSpecialEffects, aoeContext);
      getUnitsInAoe(gameState, results.units[1].team, results.units[1].pos, initiatorSpecial.aoe.shape).forEach(unit => {
        let damage = calculateAoeDamage(results.units[0], unit, initiatorSpecial.aoe.multiplier) + specialFlags.situationalFixedDamage;
        if (unit.id === results.units[1].id) {
          results.units[1].stats.hp = Math.max(1, results.units[1].stats.hp - damage);
          results.units[1].startOfCombatHp = results.units[1].stats.hp;
        }
        results.sequence.push({
          attacker: results.units[0].id,
          defender: unit.id,
          damage,
          aoe: true
        });
      });
      results.units[0].special.current = results.units[0].special.max;
    }

    resolveStartOfCombatEffects(results, gameState);
    resolveDuringCombatEffects(results, gameState);

    // begin the hitting
    const isAlive = unit => unit.stats.hp > 0;
    const doneAttacking = unit => {
      if (!unit.canAttack) return true;
      return unit.canDouble ? unit.followUpAttackDone : unit.firstAttackDone;
    }
    let lastAttacker;
    while (results.units.every(isAlive) && !results.units.every(doneAttacking)) {
      const nextAttacker = results.units[results.combatState.nextAttacker];
      const nextDefender = results.units[results.combatState.nextAttacker ^ 1];
      if (!doneAttacking(nextAttacker)) {
        performNextAttack(results, gameState, lastAttacker === nextAttacker.id);
        lastAttacker = nextAttacker.id;
        if (nextAttacker.flags[COMBAT_FLAG.ATTACKS_TWICE] && isAlive(nextDefender)) {
          performNextAttack(results, gameState, true);
        }
      }
      if (nextAttacker.canAttack && nextAttacker.canDouble && !nextAttacker.followUpAttackDone
        && nextAttacker.flags[COMBAT_FLAG.DESPERATION]
        && (!nextAttacker.flags[COMBAT_FLAG.HARDY_BEARING] && !nextDefender.flags[COMBAT_FLAG.HARDY_BEARING])) {
        results.combatState.nextAttacker ^= 1;
      }
      results.combatState.nextAttacker ^= 1;
    }
    results.combatState.complete = true;
    return results;
  }

  function resolveStartOfCombatEffects(results, gameState) {
    const context = { results, gameState };
    const startOfCombatEffects = [];
    startOfCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_COMBAT, results.units[0], context));
    startOfCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_COMBAT, results.units[1], context));
    gameState.teams[results.units[0].team]
      .filter(unit => unit.id !== results.units[0].id)
      .forEach(unit => startOfCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_ALLY_COMBAT, unit, context)));
    gameState.teams[results.units[1].team]
      .filter(unit => unit.id !== results.units[1].id)
      .forEach(unit => startOfCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.START_OF_ALLY_COMBAT, unit, context)));
    processEffects(startOfCombatEffects, context);

    [0, 1].forEach(i => {
      const unit = results.units[i];
      const unitInfo = UNIT[unit.unitId];
      const unitWeaponType = getWeaponType(unit);
      const foe = results.units[i ^ 1];
      const foeUnitInfo = UNIT[foe.unitId];
      const foeWeaponType = getWeaponType(foe);
      if (unit.flags[COMBAT_FLAG.NEUTRALIZE_BONUSES]) {
        results.units[i].tempStats.atk -= results.units[i].buffs.atk;
        results.units[i].tempStats.spd -= results.units[i].buffs.spd;
        results.units[i].tempStats.def -= results.units[i].buffs.def;
        results.units[i].tempStats.res -= results.units[i].buffs.res;
      } else if (unit.flags[COMBAT_FLAG.NEUTRALIZE_SPECIFIC_BONUSES].length > 0) {
        unit.flags[COMBAT_FLAG.NEUTRALIZE_SPECIFIC_BONUSES]
          .forEach(stat => results.units[i].tempStats[stat] -= results.units[i].buffs[stat]);
      }
      if (unit.flags[COMBAT_FLAG.NEUTRALIZE_PENALTIES]) {
        results.units[i].tempStats.atk += results.units[i].debuffs.atk;
        results.units[i].tempStats.spd += results.units[i].debuffs.spd;
        results.units[i].tempStats.def += results.units[i].debuffs.def;
        results.units[i].tempStats.res += results.units[i].debuffs.res;
        if (unit.flags[COMBAT_FLAG.PANIC]) {
          results.units[i].tempStats.atk += results.units[i].buffs.atk;
          results.units[i].tempStats.spd += results.units[i].buffs.spd;
          results.units[i].tempStats.def += results.units[i].buffs.def;
          results.units[i].tempStats.res += results.units[i].buffs.res;
        }
      } else if (unit.flags[COMBAT_FLAG.NEUTRALIZE_SPECIFIC_PENALTIES].length > 0) {
        unit.flags[COMBAT_FLAG.NEUTRALIZE_SPECIFIC_PENALTIES]
          .forEach(stat => results.units[i].tempStats[stat] += results.units[i].debuffs[stat]);
        if (unit.flags[COMBAT_FLAG.PANIC]) {
          unit.flags[COMBAT_FLAG.NEUTRALIZE_SPECIFIC_PENALTIES]
            .forEach(stat => results.units[i].tempStats[stat] += results.units[i].buffs[stat]);
        }
      }
    });
  }

  function toCombatUnit(unit, isInitiator, gameState) {
    const combatUnit = deepClone(unit);
    const unitWeaponType = getWeaponType(unit);
    combatUnit.tempStats = emptyStats();
    combatUnit.startOfCombatHp = unit.stats.hp;
    combatUnit.isInitiator = isInitiator;
    combatUnit.onDefensiveTerrain = gameState.map.defensiveTerrain.some(pos => pos.x === unit.pos.x && pos.y === unit.pos.y);
    combatUnit.advantageMod = 0;
    combatUnit.effectiveMod = 0;
    combatUnit.staffMod = unitWeaponType.id === WEAPON_TYPE.STAFF.id ? 0.5 : 1;
    combatUnit.constantFixedDamage = 0;

    combatUnit.canAttack = isInitiator;
    combatUnit.canDouble = false;
    combatUnit.timesAttacked = 0;
    combatUnit.firstAttackDone = false;
    combatUnit.followUpAttackDone = false;

    const combatFlags = Object.fromEntries(Object.values(COMBAT_FLAG).map(flag => [flag, 0]));
    combatFlags[COMBAT_FLAG.NEUTRALIZE_SPECIFIC_BONUSES] = [];
    combatFlags[COMBAT_FLAG.NEUTRALIZE_SPECIFIC_PENALTIES] = [];
    combatFlags[COMBAT_FLAG.EFFECTIVE_AGAINST_MOVE_TYPE] = [];
    combatFlags[COMBAT_FLAG.EFFECTIVE_AGAINST_WEAPON_TYPE] = [];
    combatFlags[COMBAT_FLAG.NEUTRALIZE_EFFECTIVE_AGAINST_MOVE_TYPE] = [];
    combatFlags[COMBAT_FLAG.NEUTRALIZE_EFFECTIVE_AGAINST_WEAPON_TYPE] = [];
    combatFlags[COMBAT_FLAG.CONSECUTIVE_HIT_DAMAGE_REDUCTION] = [];

    combatUnit.flags = combatFlags;

    return combatUnit;
  }

  function getUnitsInAoe(gameState, team, pos, shape) {
    const affectedUnits = [];
    shape.forEach(offset => {
      const offsetPos = { x: pos.x + offset.x, y: pos.y + offset.y };
      const unitAtPos = gameState.teams[team].find(unit => unit.pos.x === offsetPos.x && unit.pos.y === offsetPos.y);
      if (unitAtPos) {
        affectedUnits.push(unitAtPos);
      }
    });
    return affectedUnits;
  }

  function calculateAoeDamage(attacker, target, multiplier) {
    // todo adaptive damage, def terrain
    const defStat = getWeaponType(attacker).defStat;
    return Math.floor(multiplier * (getVisibleStats(attacker).atk - getVisibleStats(target)[defStat]));
  }

  function resolveDuringCombatEffects(results, gameState) {
    const context = { results, gameState };
    const duringCombatEffects = [];
    duringCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.DURING_COMBAT, results.units[0], context));
    duringCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.DURING_COMBAT, results.units[1], context));
    gameState.teams[results.units[0].team]
      .filter(unit => unit.id !== results.units[0].id)
      .forEach(unit => duringCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.DURING_ALLY_COMBAT, unit, context)));
    gameState.teams[results.units[1].team]
      .filter(unit => unit.id !== results.units[1].id)
      .forEach(unit => duringCombatEffects.push(...getEligibleEffects(EFFECT_PHASE.DURING_ALLY_COMBAT, unit, context)));
    processEffects(duringCombatEffects, context);

    const totalStats = [0, 1].map(i => getTotalInCombatStats(results.units[i]));
    [0, 1].forEach(i => {
      const unit = results.units[i];
      const unitInfo = UNIT[unit.unitId];
      const unitWeaponType = getWeaponType(unit);
      const foe = results.units[i ^ 1];
      const foeUnitInfo = UNIT[foe.unitId];
      const foeWeaponType = getWeaponType(foe);
      if (!unit.isInitiator) {
        if (unit.flags[COMBAT_FLAG.CANT_COUNTERATTACK]) {
          unit.canAttack = false;
        } else if (unit.flags[COMBAT_FLAG.CAN_COUNTERATTACK_REGARDLESS_OF_FOES_RANGE]) {
          unit.canAttack = true;
        } else {
          unit.canAttack = unitWeaponType.range === foeWeaponType.range;
        }
        if (unit.flags[COMBAT_FLAG.VANTAGE] && (!unit.flags[COMBAT_FLAG.HARDY_BEARING] && !foe.flags[COMBAT_FLAG.HARDY_BEARING])) {
          results.combatState.nextAttacker = 1;
        }
      }
      if (unit.flags[COMBAT_FLAG.WTA_VS_COLOURLESS] && foeWeaponType.colour === COLOUR.COLOURLESS) {
        unit.advantageMod = 0.2;
      } else if (foe.flags[COMBAT_FLAG.WTA_VS_COLOURLESS] && unitWeaponType.colour === COLOUR.COLOURLESS) {
        unit.advantageMod = -0.2;
      } else {
        unit.advantageMod = getAdvantageMod(unitWeaponType.colour, foeWeaponType.colour);
      }
      const weHaveTA = unit.flags[COMBAT_FLAG.TRIANGLE_ADEPT] > 0;
      const theyHaveTA = foe.flags[COMBAT_FLAG.TRIANGLE_ADEPT] > 0;
      if (weHaveTA || theyHaveTA) {
        const weHaveCA = unit.flags[COMBAT_FLAG.CANCEL_AFFINITY] > 0;
        const theyHaveCA = foe.flags[COMBAT_FLAG.CANCEL_AFFINITY] > 0;
        if ((weHaveTA && weHaveCA) || (theyHaveTA && theyHaveCA)) {
          // If one unit has both TA and CA, negate TA (do nothing)
        }
        else if ((weHaveTA && theyHaveCA) || (theyHaveTA && weHaveCA)) {
          // If one unit has TA and the other has CA, reverse advantageMod
          unit.advantageMod -= 0.2 * Math.sign(unit.advantageMod);
        }
        else {
          // Default case
          unit.advantageMod += 0.2 * Math.sign(unit.advantageMod);
        }
      }
      const effectiveAgainstFoesMoveType = unit.flags[COMBAT_FLAG.EFFECTIVE_AGAINST_MOVE_TYPE].includes(foeUnitInfo.moveType);
      const effectiveAgainstMoveTypeNeutralized = foe.flags[COMBAT_FLAG.NEUTRALIZE_EFFECTIVE_AGAINST_MOVE_TYPE].includes(foeUnitInfo.moveType);
      unit.effectiveMod = effectiveAgainstFoesMoveType && !effectiveAgainstMoveTypeNeutralized ? 0.5 : 0;
      if (unit.effectiveMod === 0) { // if already effective, no need to check again
        const effectiveAgainstFoesWeaponType = unit.flags[COMBAT_FLAG.EFFECTIVE_AGAINST_WEAPON_TYPE].includes(foeUnitInfo.weaponType);
        const effectiveAgainstWeaponTypeNeutralized = foe.flags[COMBAT_FLAG.NEUTRALIZE_EFFECTIVE_AGAINST_MOVE_TYPE].includes(foeUnitInfo.weaponType);
        unit.effectiveMod = effectiveAgainstFoesWeaponType && !effectiveAgainstWeaponTypeNeutralized ? 0.5 : 0;
      }
      if (unit.flags[COMBAT_FLAG.WRATHFUL]) {
        unit.staffMod = 1;
      }
    });
    const duringCombat2Effects = [];
    duringCombat2Effects.push(...getEligibleEffects(EFFECT_PHASE.DURING_COMBAT_2, results.units[0], context));
    duringCombat2Effects.push(...getEligibleEffects(EFFECT_PHASE.DURING_COMBAT_2, results.units[1], context));
    processEffects(duringCombat2Effects, context);
    const totalStats2 = [0, 1].map(i => getTotalInCombatStats(results.units[i]));
    [0, 1].forEach(i => {
      const unit = results.units[i];
      const unitInfo = UNIT[unit.unitId];
      const unitWeaponType = getWeaponType(unit);
      const foe = results.units[i ^ 1];
      const foeUnitInfo = UNIT[foe.unitId];
      const foeWeaponType = getWeaponType(foe);
      if (unit.flags[COMBAT_FLAG.CANT_FOLLOW_UP] > unit.flags[COMBAT_FLAG.GUARANTEED_FOLLOW_UP]) {
        unit.canDouble = false;
      } else if (unit.flags[COMBAT_FLAG.GUARANTEED_FOLLOW_UP] > unit.flags[COMBAT_FLAG.CANT_FOLLOW_UP]) {
        unit.canDouble = true;
      } else {
        unit.canDouble = totalStats[i].spd - totalStats[i ^ 1].spd >= 5;
      }

      // only for combat preview
      let defStat = getWeaponType(unit).defStat;
      if (unit.flags[COMBAT_FLAG.CALCULATE_DAMAGE_USING_LOWER_OF_DEF_RES]) {
        if (totalStats2[i ^ 1].def < totalStats2[i ^ 1].res) defStat = STATS.DEF;
        else if (totalStats2[i ^ 1].res < totalStats2[i ^ 1].def) defStat = STATS.RES;
      }
      const terrainMod = foe.onDefensiveTerrain ? 0.3 : 0;
      unit.baseDamage = totalStats2[i].atk;
      unit.baseDamage += Math.floor(unit.baseDamage * unit.advantageMod);
      unit.baseDamage += Math.floor(unit.baseDamage * unit.effectiveMod);
      unit.baseDamage -= totalStats2[i ^ 1][defStat];
      unit.baseDamage -= Math.floor(totalStats2[i ^ 1][defStat] * terrainMod);
      unit.baseDamage = Math.max(unit.baseDamage, 0);
    });
  }

  function getVisibleStats(unit) {
    const stats = { hp: unit.stats.hp }
    const hasPanic = unit.penalties.includes(STATUS.PANIC.id);
    [STATS.ATK, STATS.SPD, STATS.DEF, STATS.RES].forEach(stat => {
      if (hasPanic) {
        stats[stat] = Math.max(unit.stats[stat] - unit.buffs[stat] - unit.debuffs[stat], 0);
      } else {
        stats[stat] = Math.max(unit.stats[stat] + unit.buffs[stat] - unit.debuffs[stat], 0);
      }
    });
    return stats;
  }

  function getTotalInCombatStats(unit) {
    const visibleStats = getVisibleStats(unit);
    const inCombatStats = { hp: unit.stats.hp };

    [STATS.ATK, STATS.SPD, STATS.DEF, STATS.RES].forEach(stat => {
      inCombatStats[stat] = Math.max(visibleStats[stat] + unit.tempStats[stat], 0);
    });
    return inCombatStats;
  }

  function getAdvantageMod(unitColour, foeColour) {
    const advantageMap = {
      [COLOUR.RED]: COLOUR.GREEN,
      [COLOUR.GREEN]: COLOUR.BLUE,
      [COLOUR.BLUE]: COLOUR.RED
    };
    if (advantageMap[unitColour] === foeColour) {
      return 0.2;
    } else if (advantageMap[foeColour] === unitColour) {
      return -0.2;
    }
    return 0;
  }

  function performNextAttack(results, gameState, isConsecutiveAttack) {
    const attacker = results.units[results.combatState.nextAttacker];
    const defender = results.units[results.combatState.nextAttacker ^ 1];
    const attackerFlags = attacker.flags;
    const defenderFlags = defender.flags;
    const attackerTotalStats = getTotalInCombatStats(attacker);
    const defenderTotalStats = getTotalInCombatStats(defender);
    const attackerSpecial = getSpecialInfo(attacker);
    const defenderSpecial = getSpecialInfo(defender);
    const attackerSpecialTriggered = attackerSpecial?.specialType === SPECIAL_TYPE.OFFENSIVE && attacker.special.current === 0;
    const specialFlags = {
      baseDamagePercent: 100,
      damage: 0,
      reduceDefResByPercent: 0,
      situationalFixedDamage: 0,
      percentReductions: [],
      flatReduction: 0
    };
    const context = {
      results,
      gameState,
      specialFlags
    }
    const defenderSpecialTriggered = defenderSpecial?.specialType === SPECIAL_TYPE.DEFENSIVE
      && defender.special.current === 0
      && evaluateCondition(defenderSpecial.triggerCondition, { unit: defender, ...context });
    if (attackerSpecialTriggered) {
      const onSpecialEffects = getEligibleEffects(EFFECT_PHASE.ON_OFFENSIVE_SPECIAL_TRIGGER, attacker, context);
      processEffects(onSpecialEffects, context);
    }
    if (defenderSpecialTriggered) {
      const onSpecialEffects = getEligibleEffects(EFFECT_PHASE.ON_DEFENSIVE_SPECIAL_TRIGGER, defender, context);
      processEffects(onSpecialEffects, context);
    }
    if (specialFlags.addDamageByPercentOfStat) {
      specialFlags.damage += specialFlags.addDamageByPercentOfStat(attackerTotalStats);
    }
    if (specialFlags.addDamageByPercentOfMissingHp) {
      specialFlags.damage += specialFlags.addDamageByPercentOfMissingHp(attacker.stats.maxHp - attacker.stats.hp);
    }

    let defStat = getWeaponType(attacker).defStat;
    if (attackerFlags[COMBAT_FLAG.CALCULATE_DAMAGE_USING_LOWER_OF_DEF_RES]) {
      if (defenderTotalStats.def < defenderTotalStats.res) defStat = STATS.DEF;
      else if (defenderTotalStats.res < defenderTotalStats.def) defStat = STATS.RES;
    }
    const terrainMod = defender.onDefensiveTerrain ? 0.3 : 0;

    let baseDamage = attackerTotalStats.atk;
    baseDamage += Math.floor(baseDamage * attacker.advantageMod);
    baseDamage += Math.floor(baseDamage * attacker.effectiveMod);
    baseDamage -= defenderTotalStats[defStat];
    baseDamage -= Math.floor(defenderTotalStats[defStat] * terrainMod);
    baseDamage += Math.floor(defenderTotalStats[defStat] * specialFlags.reduceDefResByPercent / 100);
    baseDamage += specialFlags.damage;
    baseDamage = Math.floor(baseDamage * specialFlags.baseDamagePercent / 100);
    baseDamage = Math.max(baseDamage, 0);

    const percentReductions = [];
    percentReductions.push(...specialFlags.percentReductions);
    if (isConsecutiveAttack) {
      percentReductions.push(...defender.flags[COMBAT_FLAG.CONSECUTIVE_HIT_DAMAGE_REDUCTION]);
    }
    const situationalFixedDamage = specialFlags.situationalFixedDamage;
    const percentReduction = calculateTotalPercentReduction(percentReductions);
    const fixedReduction = specialFlags.flatReduction;
    const fixedDamage = Math.floor(situationalFixedDamage + attacker.constantFixedDamage);

    let damage = Math.floor((baseDamage + fixedDamage) * attacker.staffMod);
    damage -= Math.floor(damage * percentReduction) - fixedReduction;

    let miracleSpecialTriggered = false;
    if (defender.stats.hp > 1 && damage >= defender.stats.hp) {
      if (defenderSpecial?.specialType === SPECIAL_TYPE.MIRACLE && defender.special.current === 0) {
        miracleSpecialTriggered = true;
        // maybe on special triggered phase?
        damage = defender.stats.hp - 1;
      }
    }

    defender.stats.hp = Math.max(defender.stats.hp - damage, 0);
    let healValue = 0;
    if (specialFlags.restoreHpByPercentDamageDealt) {
      healValue += specialFlags.restoreHpByPercentDamageDealt(damage);
    }
    // if (attackerFlags[COMBAT_FLAG.PERCENT_HEALING_ON_HIT]) {
    //   healValue += Math.floor(damage * attackerFlags[COMBAT_FLAG.PERCENT_HEALING_ON_HIT] / 100);
    // }
    attacker.stats.hp = Math.min(attacker.stats.hp + healValue, attacker.stats.maxHp);

    if (attackerSpecial) {
      if (attackerSpecialTriggered) {
        attacker.special.current = attacker.special.max;
      } else {
        const hasExtraSpecialCharge = attackerFlags[COMBAT_FLAG.SPECIAL_CHARGES_PER_ATTACK] > 0 || attackerFlags[COMBAT_FLAG.SPECIAL_CHARGES_PER_UNIT_ATTACK] > 0;
        const affectedByGuard = attackerFlags[COMBAT_FLAG.GUARD] > 0;
        const charge = 1 + (hasExtraSpecialCharge ? 1 : 0) - (affectedByGuard ? 1 : 0);
        attacker.special.current = Math.max(attacker.special.current - charge, 0);
      }
    }
    if (defenderSpecial || miracleSpecialTriggered) {
      if (defenderSpecialTriggered || miracleSpecialTriggered) {
        defender.special.current = defender.special.max;
      } else {
        const hasExtraSpecialCharge = defenderFlags[COMBAT_FLAG.SPECIAL_CHARGES_PER_ATTACK] > 0 || defenderFlags[COMBAT_FLAG.SPECIAL_CHARGES_PER_FOE_ATTACK] > 0;
        const affectedByGuard = defenderFlags[COMBAT_FLAG.GUARD] > 0;
        const charge = 1 + (hasExtraSpecialCharge ? 1 : 0) - (affectedByGuard ? 1 : 0);
        defender.special.current = Math.max(defender.special.current - charge, 0);
      }
    }

    results.sequence.push({
      attacker: attacker.id,
      defender: defender.id,
      attackerSpecialTriggered,
      defenderSpecialTriggered,
      attackerSpecialCharge: attacker.special.current,
      defenderSpecialCharge: defender.special.current,
      damage,
      healing: healValue
    });

    attacker.timesAttacked += 1;
    attacker.firstAttackDone = attacker.timesAttacked >= (attackerFlags[COMBAT_FLAG.ATTACKS_TWICE] ? 2 : 1);
    attacker.followUpAttackDone = attacker.timesAttacked >= (attackerFlags[COMBAT_FLAG.ATTACKS_TWICE] ? 4 : 2);
  }

  function calculateTotalPercentReduction(percentReductions) {
    let remainingDamageMultiplier = 1;
    percentReductions.forEach(percent => remainingDamageMultiplier *= (1 - percent / 100));
    return 1 - remainingDamageMultiplier;
  }

  function getEligibleEffects(phase, unit, context) {
    const effects = [
      ...(unit.skills.flatMap(skill => SKILLS[skill].effects ?? []) ?? []),
      ...(unit.bonuses?.flatMap(bonus => STATUS[bonus].effects) ?? []),
      ...(unit.penalties?.flatMap(penalty => STATUS[penalty].effects) ?? [])
    ];
    const actions = [];
    effects
      .filter(effect => effect.phase === phase)
      .forEach(effect => {
        if (evaluateCondition(effect.condition, { unit, ...context })) {
          effect.actions.forEach(action => actions.push({ action, unit }));
        }
      });
    return actions;
  }

  function processEffects(effects, context) {
    if (!context.results || context.results.combatState.complete) {
      processOutOfCombatEffects(effects, context);
    } else {
      processCombatEffects(effects, context);
    }
  }

  function processOutOfCombatEffects(effects, context) {
    const hpChanges = new Map();
    effects.forEach(({ action, unit }) => {
      if (action.type === EFFECT_ACTION.DEAL_DAMAGE || action.type === EFFECT_ACTION.RESTORE_HP) {
        const targets = getTargetedUnits({ unit, ...context }, action.target);
        let value = action.value;
        if (action.calculation?.type === EFFECT_CALCULATION.HP_RESTORED_TO_TARGET) value = context.hpRestored;
        if (action.type === EFFECT_ACTION.DEAL_DAMAGE) value = -value;
        targets.forEach(target => hpChanges.set(target.id, (hpChanges.get(target) || 0) + value));
      } else {
        performEffectAction(action, { unit, ...context })
      }
    });

    hpChanges.forEach((value, id) => {
      const target = context.gameState.teams[0]
        .concat(context.gameState.teams[1])
        .find(unit => unit.id === id);
      hashHp(context.gameState, target);
      target.stats.hp = Math.max(1, Math.min(target.stats.maxHp, target.stats.hp + value));
      hashHp(context.gameState, target);
    });
  }

  function processCombatEffects(effects, context) {
    effects.sort((a, b) => {
      if (a.action.type === EFFECT_ACTION.SET_COMBAT_FLAG) return -1;
      if (b.action.type === EFFECT_ACTION.SET_COMBAT_FLAG) return 1;
      if (a.action.type === EFFECT_ACTION.COMBAT_STAT_MOD) return -1;
      if (b.action.type === EFFECT_ACTION.COMBAT_STAT_MOD) return 1;
      return 0;
    });
    effects.forEach(({ action, unit }) => performEffectAction(action, { unit, ...context }));
  }

  function evaluateCondition(condition, context) {
    if (!condition) return true;

    const { operator, conditions, type, ...params } = condition;

    if (operator) {
      if (operator === CONDITION_OPERATOR.AND) {
        return conditions.every(cond => evaluateCondition(cond, context));
      } else if (operator === CONDITION_OPERATOR.OR) {
        return conditions.some(cond => evaluateCondition(cond, context));
      }
    }

    const unit = context.unit;
    const unitIndex = context.results?.units.findIndex(u => u.id === unit.id);
    const foe = context.results?.units.find(u => u.team !== unit.team);
    const foeIndex = unitIndex ^ 1;

    switch (type) {
      case EFFECT_CONDITION.IS_TURN_COUNT:
        return context.gameState.turnCount === params.turnCount;
      case EFFECT_CONDITION.IS_ODD_TURN:
        return context.gameState.turnCount % 2 === 1;
      case EFFECT_CONDITION.IS_EVEN_TURN:
        return context.gameState.turnCount % 2 === 0;
      case EFFECT_CONDITION.EVERY_THIRD_TURN:
        return context.gameState.turnCount % 3 === 1;
      case EFFECT_CONDITION.UNIT_INITIATES_COMBAT:
        return context.results.units[unitIndex].isInitiator;
      case EFFECT_CONDITION.FOE_INITIATES_COMBAT:
        return foe.isInitiator;
      case EFFECT_CONDITION.UNIT_HP_GREATER_THAN:
        if (params.value) {
          return unit.stats.hp > params.value;
        }
        return unit.stats.hp > (unit.stats.maxHp * (params.percent / 100));
      case EFFECT_CONDITION.UNIT_HP_GREATER_THAN_EQUAL_TO:
        return unit.stats.hp >= (unit.stats.maxHp * (params.percent / 100));
      case EFFECT_CONDITION.UNIT_HP_LESS_THAN:
        return unit.stats.hp < (unit.stats.maxHp * (params.percent / 100));
      case EFFECT_CONDITION.UNIT_HP_LESS_THAN_EQUAL_TO:
        return unit.stats.hp <= (unit.stats.maxHp * (params.percent / 100));
      case EFFECT_CONDITION.UNIT_HP_IS_MAX_HP:
        if (params.checkStartOfCombatHp) return unit.startOfCombatHp === unit.stats.maxHp;
        return unit.stats.hp === unit.stats.maxHp;
      case EFFECT_CONDITION.FOE_HP_GREATER_THAN:
        return foe.stats.hp > (foe.stats.maxHp * (params.percent / 100));
      case EFFECT_CONDITION.FOE_HP_GREATER_THAN_EQUAL_TO:
        return foe.stats.hp >= (foe.stats.maxHp * (params.percent / 100));
      case EFFECT_CONDITION.FOE_HP_LESS_THAN:
        return foe.stats.hp < (foe.stats.maxHp * (params.percent / 100));
      case EFFECT_CONDITION.FOE_HP_LESS_THAN_EQUAL_TO:
        return foe.stats.hp < (foe.stats.maxHp * (params.percent / 100));
      case EFFECT_CONDITION.FOE_HP_IS_MAX_HP:
        return foe.stats.hp === foe.stats.maxHp;
      case EFFECT_CONDITION.BUFF_ACTIVE_ON_UNIT:
        return unit.buffs.length > 0;
      case EFFECT_CONDITION.DEBUFF_ACTIVE_ON_UNIT:
        return unit.debuffs.length > 0;
      case EFFECT_CONDITION.BONUS_ACTIVE_ON_UNIT:
        return unit.bonuses.length > 0;
      case EFFECT_CONDITION.PENALTY_ACTIVE_ON_UNIT:
        return unit.penalties.length > 0;
      case EFFECT_CONDITION.UNIT_WITHIN_X_SPACES_OF_ALLY:
        return handleUnitWithinSpacesOfAlly(context, params);
      case EFFECT_CONDITION.UNIT_IS_ADJACENT_TO_ALLY:
        return handleUnitWithinSpacesOfAlly(context, { spaces: 1 });
      case EFFECT_CONDITION.UNIT_NOT_ADJACENT_TO_ALLY:
        return !handleUnitWithinSpacesOfAlly(context, { spaces: 1 });
      case EFFECT_CONDITION.ALLY_IN_COMBAT_WITHIN_X_SPACES_OF_UNIT:
        return handleAllyInCombatWithinSpacesOfUnit(context, params);
      case EFFECT_CONDITION.MOVING_ALLY_WITHIN_X_SPACES_OF_UNIT:
        return handleMovingAllyWithinSpacesOfUnit(context, params);
      case EFFECT_CONDITION.FOE_IS_MOVE_TYPE:
        return handleFoeIsMoveType(context, params);
      case EFFECT_CONDITION.FOE_IS_WEAPON_TYPE:
        return handleFoeIsWeaponType(context, params);
      case EFFECT_CONDITION.FOE_CAN_COUNTER:
        return context.results.units[foeIndex].canAttack;
      case EFFECT_CONDITION.FOE_HAS_X_RANGE:
        return getWeaponType(foe).range === params.range;
      case EFFECT_CONDITION.UNIT_ATTACKED_DURING_COMBAT:
        return context.results.units[unitIndex].timesAttacked > 0;
      case EFFECT_CONDITION.FOES_ATTACK_CAN_TRIGGER_UNITS_SPECIAL:
        return handleFoesAttackCanTriggerUnitsSpecial(context);
      case EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE:
      case EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_EQUAL_TO_FOE:
      case EFFECT_CONDITION.UNIT_STAT_LESS_THAN_FOE:
      case EFFECT_CONDITION.UNIT_STAT_LESS_THAN_EQUAL_TO_FOE:
        return evaluateStatCondition(context, condition);
      case EFFECT_CONDITION.FIRST_COMBAT_IN_PHASE:
        return unit.combatsInPhase === 0;
      default:
        return false;
    }
  }

  function handleUnitWithinSpacesOfAlly({ unit, gameState }, { spaces, moveType, weaponType, count }) {
    const allyUnits = gameState.teams[unit.team]
      .filter(u => u.id !== unit.id)
      .filter(u => manhattan(u.pos, unit.pos) <= spaces)
      .filter(u => !moveType || UNIT[u.unitId].moveType === moveType)
      .filter(u => !weaponType || UNIT[u.unitId].weaponType === weaponType);
    return count ? allyUnits.length >= count : allyUnits.length > 0;
  }

  function handleAllyInCombatWithinSpacesOfUnit({ unit, results }, { spaces, moveType, weaponType }) {
    const allyInCombat = results.units.find(u => u.team === unit.team);
    if (moveType) {
      if (UNIT[allyInCombat.unitId].moveType !== moveType) return false;
    }
    if (weaponType) {
      if (UNIT[allyInCombat.unitId].weaponType !== weaponType) return false;
    }
    return manhattan(allyInCombat.pos, unit.pos) <= spaces;
  }

  function handleMovingAllyWithinSpacesOfUnit({ movingUnit, unit }, { spaces, moveType }) {
    if (moveType) {
      if (UNIT[movingUnit.unitId].moveType !== moveType) return false;
    }
    return manhattan(movingUnit.pos, unit.pos) <= spaces;
  }

  function handleFoeIsMoveType({ unit, results }, { moveType }) {
    const foe = results.units.find(u => u.team !== unit.team);
    const foeUnitInfo = UNIT[foe.unitId];
    return foeUnitInfo.moveType === moveType;
  }

  function handleFoeIsWeaponType({ unit, results }, { weaponType }) {
    const foe = results.units.find(u => u.team !== unit.team);
    const foeUnitInfo = UNIT[foe.unitId];
    return foeUnitInfo.weaponType === weaponType;
  }

  function handleFoesAttackCanTriggerUnitsSpecial({ unit }) {
    const unitSpecial = getSpecialInfo(unit);
    return unitSpecial?.specialType === SPECIAL_TYPE.DEFENSIVE || unitSpecial?.specialType === SPECIAL_TYPE.MIRACLE;
  }

  function evaluateStatCondition({ unit, results }, condition) {
    const foe = results.units.find(u => u.id !== unit.id);
    let unitValue = 0;
    let foeValue = 0;
    if (!condition.statType || condition.statType === STAT_CHECK_TYPE.VISIBLE) {
      // might need to get unit from gameState (in first object) for accurate visible stat
      unitValue = getVisibleStats(unit)[condition.unitStat];
      foeValue = getVisibleStats(foe)[condition.foeStat];
    } else if (condition.statType === STAT_CHECK_TYPE.IN_COMBAT) {
      unitValue = getTotalInCombatStats(results.units.find(u => u.id === unit.id))[condition.unitStat];
      foeValue = getTotalInCombatStats(foe)[condition.foeStat];
    }
    if (condition.unitModifier) {
      unitValue += condition.unitModifier;
    }
    if (condition.foeModifier) {
      foeValue += condition.foeModifier;
    }
    unitValue += unit.phantomStats[condition.unitStat] ?? 0;
    foeValue += foe.phantomStats[condition.foeStat] ?? 0;
    switch (condition.type) {
      case EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE:
        return unitValue > foeValue;
      case EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_EQUAL_TO_FOE:
        return unitValue >= foeValue;
      case EFFECT_CONDITION.UNIT_STAT_LESS_THAN_FOE:
        return unitValue < foeValue;
      case EFFECT_CONDITION.UNIT_STAT_LESS_THAN_EQUAL_TO_FOE:
        return unitValue <= foeValue;
    }
  }

  function performEffectAction(action, context) {
    switch (action.type) {
      case EFFECT_ACTION.EQUIP_STAT_MOD:
        applyEquipStatMod(action, context);
        break;
      case EFFECT_ACTION.PHANTOM_STAT:
        applyPhantomStat(action, context);
        break;
      case EFFECT_ACTION.MAX_SPECIAL_COOLDOWN_MOD:
        applyMaxSpecialCooldownMod(action, context);
        break;
      case EFFECT_ACTION.CURRENT_SPECIAL_COOLDOWN_MOD:
        applyCurrentSpecialCooldownMod(action, context);
        break;
      case EFFECT_ACTION.COMBAT_STAT_MOD:
        applyCombatStatMod(action, context);
        break;
      case EFFECT_ACTION.SET_COMBAT_FLAG:
        setCombatFlag(action, context);
        break;
      case EFFECT_ACTION.DEAL_DAMAGE:
        handleDealDamage(action, context);
        break;
      case EFFECT_ACTION.RESTORE_HP:
        handleRestoreHp(action, context);
        break;
      case EFFECT_ACTION.APPLY_BUFF:
        applyBuff(action, context);
        break;
      case EFFECT_ACTION.APPLY_DEBUFF:
        applyDebuff(action, context);
        break;
      case EFFECT_ACTION.APPLY_STATUS:
        applyStatus(action, context);
        break;
      case EFFECT_ACTION.DAMAGE_REDUCTION:
        handleDamageReduction(action, context);
        break;
      case EFFECT_ACTION.REDUCE_DEF_RES_BY:
        handleReduceDefResBy(action, context);
        break;
      case EFFECT_ACTION.BASE_DAMAGE_INCREASE:
        handleBaseDamageIncrease(action, context);
        break;
      case EFFECT_ACTION.MOVE_EXTRA_SPACES:
        context.movementFlags.extraSpaces = action.spaces;
        break;
      case EFFECT_ACTION.SET_MOVEMENT_FLAG:
        context.movementFlags[action.flag] = true;
        break;
      case EFFECT_ACTION.OBSTRUCT_TILES:
        handleObstructTiles(action, context);
        break;
      case EFFECT_ACTION.ENABLE_WARP:
        handleWarping(action, context);
        break;
      case EFFECT_ACTION.POST_COMBAT_MOVEMENT:
        handlePostCombatMovement(action, context);
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  };

  function getTargetedUnits(context, target) {
    const unit = context.unit;
    const team = context.unit.team;
    const foeInCombat = context.results?.units.find(u => u.team !== team);
    switch (target.type) {
      case EFFECT_TARGET.SELF:
        return [unit];
      case EFFECT_TARGET.ALLY_IN_COMBAT:
        return [context.results.units.find(u => u.team === team)];
      case EFFECT_TARGET.FOE:
      case EFFECT_TARGET.FOE_IN_COMBAT:
        return [foeInCombat];
      case EFFECT_TARGET.FOE_POST_COMBAT:
        const foe = context.gameState.teams[team ^ 1].find(u => u.id === foeInCombat.id);
        return [foe ?? foeInCombat];
      case EFFECT_TARGET.FOES_WITHIN_X_SPACES_OF_FOE:
        return context.gameState.teams[team ^ 1]
          .filter(u => u.id !== foeInCombat.id)
          .filter(u => manhattan(u.pos, foeInCombat.pos) <= target.spaces);
      case EFFECT_TARGET.FOE_AND_FOES_WITHIN_X_SPACES_OF_FOE:
        return context.gameState.teams[team ^ 1].filter(u => manhattan(u.pos, foeInCombat.pos) <= target.spaces);
      case EFFECT_TARGET.UNIT_AND_ALLIES_WITHIN_X_SPACES:
        return context.gameState.teams[team]
          .filter(u => manhattan(u.pos, unit.pos) <= target.spaces)
          .filter(u => !target.moveType || target.moveType === UNIT[u.unitId].moveType)
          .filter(u => !target.weaponType || target.weaponType === UNIT[u.unitId].weaponType);
      case EFFECT_TARGET.ALLIES_WITHIN_X_SPACES:
        return context.gameState.teams[team]
          .filter(u => u !== unit && manhattan(u.pos, unit.pos) <= target.spaces)
          .filter(u => !target.moveType || target.moveType === UNIT[u.unitId].moveType)
          .filter(u => !target.weaponType || target.weaponType === UNIT[u.unitId].weaponType);
      case EFFECT_TARGET.FOES_WITHIN_X_SPACES:
        return context.gameState.teams[team ^ 1].filter(u => manhattan(u.pos, unit.pos) <= target.spaces);
      case EFFECT_TARGET.FOES_IN_CARDINAL_DIRECTIONS:
        return getFoesInCardinalDirections(context.gameState, unit, target);
      case EFFECT_TARGET.FOE_WITH_HIGHEST_STAT:
        return getFoesWithHighestStat(context.gameState, team, target.stat);
      case EFFECT_TARGET.FOE_WITH_LOWEST_STAT:
        return geFoesWithLowestStat(context.gameState, team, target.stat);
      case EFFECT_TARGET.ASSIST_USER:
        return [context.assistUser];
      case EFFECT_TARGET.ASSIST_TARGET:
        return [context.assistTarget];
      case EFFECT_TARGET.ALL_ALLIES:
        return getAllAllies(context.gameState, unit, target);
      case EFFECT_TARGET.ALL_FOES:
        return [...context.gameState.teams[team ^ 1]];
      default:
        return [];
    }
  };

  function getFoesInCardinalDirections(gameState, unit, target) {
    const foes = gameState.teams[unit.team ^ 1];
    return foes.filter(foe => {
      const isInCardinalDirection = foe.pos.x === unit.pos.x || foe.pos.y === unit.pos.y;
      if (!isInCardinalDirection) return false;
      if (target.with === EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_FOE) {
        const unitStatValue = unit.stats[target.unitStat];
        const foeStatValue = foe.stats[target.foeStat];
        return unitStatValue > foeStatValue;
      }
      return true;
    });
  }

  function getFoesWithHighestStat(gameState, team, stat) {
    let highestStat = -6969;
    gameState.teams[team].forEach(unit => {
      const unitStats = getVisibleStats(unit);
      if (unitStats[stat] > highestStat) {
        highestStat = unitStats[stat];
      }
    });
    return gameState.teams[team].filter(unit => unit.stats[stat] === highestStat);
  }

  function geFoesWithLowestStat(gameState, team, stat) {
    let lowestStat = 6969;
    gameState.teams[team].forEach(unit => {
      const unitStats = getVisibleStats(unit);
      if (unitStats[stat] < lowestStat) {
        lowestStat = unitStats[stat];
      }
    });
    return gameState.teams[team].filter(unit => unit.stats[stat] === lowestStat);
  }

  function getAllAllies(gameState, unit, target) {
    return gameState.teams[unit.team].filter(ally => {
      if (ally.id === unit.id) return false;
      const allyInfo = UNIT[ally.unitId];
      if (target.moveType) {
        if (target.moveType !== allyInfo.moveType) return false;
      }
      if (target.with === EFFECT_CONDITION.UNIT_STAT_GREATER_THAN_ALLY) {
        const unitStat = unit.stats[target.unitStat];
        const allyStat = ally.stats[target.foeStat];
        if (!(unitStat > allyStat)) return false;
      }
      return true;
    });
  }

  function applyEquipStatMod({ stat, value }, { stats }) {
    stats[stat] = Math.max(0, stats[stat] + value);
  }

  function applyPhantomStat({ stat, value }, { phantomStats }) {
    phantomStats[stat] += value;
  }

  function applyMaxSpecialCooldownMod({ value }, { special }) {
    if (special.max !== null) {
      special.max = Math.max(special.max + value, 1);
      special.current = Math.max(special.current + value, 1);
    }
  }

  function applyCurrentSpecialCooldownMod(action, context) {
    const targets = getTargetedUnits(context, action.target);
    targets.forEach(target => {
      if (target.special.current) {
        hashSpecial(context.gameState, target);
        target.special.current += action.value;
        target.special.current = Math.min(target.special.current, target.special.max);
        target.special.current = Math.max(target.special.current, 0);
        hashSpecial(context.gameState, target);
      }
    })
  }

  function applyCombatStatMod(action, context) {
    const target = getTargetedUnits(context, action.target)[0];
    const index = context.results.units.indexOf(target);
    if (action.value) {
      context.results.units[index].tempStats[action.stat] += action.value;
    } else if (action.calculation.type === EFFECT_CALCULATION.TOTAL_BONUSES_ON_UNIT) {
      // todo neutralize specific bonuses
      if (context.results.units[index].flags[COMBAT_FLAG.NEUTRALIZE_BONUSES]) return;
      if (context.results.units[index].flags[COMBAT_FLAG.PANIC]) return;
      context.results.units[index].tempStats[action.stat] += target.buffs.atk + target.buffs.spd + target.buffs.def + target.buffs.res;
    } else if (action.calculation.type === EFFECT_CALCULATION.NUMBER_OF_ALLIES_WITHIN_X_SPACES) {
      const { spaces, multiplier = 1, max = 99 } = action.calculation;
      const numberOfAlliesInRange = context.gameState.teams[context.unit.team]
        .filter(ally => ally.id !== context.unit.id && manhattan(ally.pos, context.unit.pos) <= spaces).length;
      context.results.units[index].tempStats[action.stat] += Math.min(numberOfAlliesInRange * multiplier, max);
    }
  }

  function setCombatFlag(action, context) {
    const target = getTargetedUnits(context, action.target)[0];
    const index = context.results.units.indexOf(target);
    const unitFlags = context.results.units[index].flags;
    if (action.percent) {
      if (unitFlags[action.flag] instanceof Array) {
        unitFlags[action.flag].push(action.percent);
      } else {
        unitFlags[action.flag] += action.percent;
      }
    } else if (action.stat) {
      if (!unitFlags[action.flag].includes(action.stat)) {
        unitFlags[action.flag].push(action.stat);
      }
    } else if (action.moveType) {
      if (!unitFlags[action.flag].includes(action.moveType)) {
        unitFlags[action.flag].push(action.moveType);
      }
    } else if (action.weaponType) {
      if (!unitFlags[action.flag].includes(action.weaponType)) {
        unitFlags[action.flag].push(action.weaponType);
      }
    } else {
      unitFlags[action.flag] += 1;
    }

  }

  function handleDealDamage(action, context) {
    if (context.specialFlags) {
      if (action.value) {
        context.specialFlags.situationalFixedDamage += action.value;
      } else if (action.calculation?.type === EFFECT_CALCULATION.PERCENT_OF_STAT) {
        context.specialFlags.addDamageByPercentOfStat = stats => Math.floor(stats[action.calculation.stat] * action.calculation.percent / 100);
      } else if (action.calculation?.type === EFFECT_CALCULATION.MISSING_HP) {
        context.specialFlags.addDamageByPercentOfMissingHp = missingHp => Math.floor(missingHp * action.calculation.percent / 100);
      }
    } else {
      console.warn("shouldn't be here"); //todo check, this is old logic
      const targets = getTargetedUnits(context, action.target);
      targets.forEach(target => {
        hashHp(context.gameState, target);
        target.stats.hp = Math.max(target.stats.hp - action.value, 1);
        hashHp(context.gameState, target);
      });
    }
  }

  function handleRestoreHp(action, context) {
    if (context.specialFlags) {
      if (action.calculation.type === EFFECT_CALCULATION.PERCENT_DAMAGE_DEALT) {
        context.specialFlags.restoreHpByPercentDamageDealt = damage => Math.floor(damage * action.calculation.percent / 100);
      }
    }
  }

  function applyBuff(action, context) {
    const targets = getTargetedUnits(context, action.target);
    targets.forEach(target => {
      hashBuff(context.gameState, target, action.stat);
      target.buffs[action.stat] = Math.max(target.buffs[action.stat], action.value);
      hashBuff(context.gameState, target, action.stat);
    });
  }

  function applyDebuff(action, context) {
    const targets = getTargetedUnits(context, action.target);
    targets.forEach(target => {
      hashDebuff(context.gameState, target, action.stat);
      target.debuffs[action.stat] = Math.max(target.debuffs[action.stat], action.value);
      hashDebuff(context.gameState, target, action.stat);
    });
  }

  function applyStatus(action, context) {
    const targets = getTargetedUnits(context, action.target);
    const status = STATUS[action.status];
    if (status.type === STATUS_TYPE.POSITIVE) {
      targets.forEach(target => {
        if (!target.bonuses.includes(action.status)) {
          target.bonuses.push(action.status);
          hashBonus(context.gameState, target, action.status);
        }
      });
    } else {
      targets.forEach(target => {
        if (!target.penalties.includes(action.status)) {
          target.penalties.push(action.status);
          hashPenalty(context.gameState, target, action.status);
        }
      });
    }
  }

  function handleDamageReduction(action, context) {
    if (context.specialFlags) {
      if (action.percent) {
        context.specialFlags.percentReductions.push(action.percent);
      }
      if (action.flat) {
        context.specialFlags.flatReduction += action.flat;
      }
    }
  }

  function handleReduceDefResBy(action, context) {
    if (context.specialFlags) {
      if (action.percent) {
        context.specialFlags.reduceDefResByPercent = action.percent;
      }
    }
  }

  function handleBaseDamageIncrease(action, context) {
    if (context.specialFlags) {
      if (action.percent) {
        context.specialFlags.baseDamagePercent += action.percent;
      }
    }
  }

  function handleObstructTiles({ spaces }, { unit, gameState, movementFlags }) {
    for (let dx = -spaces; dx <= spaces; dx++) {
      for (let dy = -spaces; dy <= spaces; dy++) {
        const obstructedTile = { x: unit.pos.x + dx, y: unit.pos.y + dy };
        if (Math.abs(dx) + Math.abs(dy) <= spaces && onMap(gameState.map, obstructedTile)) {
          if (!movementFlags.obstructedTiles.some(tile => tile.x === obstructedTile.x && tile.y === obstructedTile.y)) {
            movementFlags.obstructedTiles.push(obstructedTile);
          }
        }
      }
    }
  }

  function handleWarping({ target }, { unit, movingUnit, gameState, movementFlags }) {
    if (target.type === EFFECT_TARGET.SPACES_WITHIN_UNIT) {
      addWarpableTilesAroundUnit(unit, movingUnit, target.spaces, gameState, movementFlags);
    } else if (target.type === EFFECT_TARGET.SPACES_WITHIN_ALLIES) {
      const { moveType, allyRange, warpRange, hpThreshold } = target;
      gameState.teams[unit.team].forEach(ally => {
        if (ally.id === unit.id) return;
        if (moveType && UNIT[ally.unitId].moveType !== moveType) return;
        if (allyRange && manhattan(unit.pos, ally.pos) > allyRange) return;
        if (hpThreshold && Math.floor(ally.stats.hp / ally.stats.maxHp * 100) > hpThreshold) return;
        addWarpableTilesAroundUnit(ally, movingUnit, warpRange, gameState, movementFlags);
      });
    }
  }

  function addWarpableTilesAroundUnit(unit, warpingUnit, spaces, gameState, movementFlags) {
    for (let dx = -spaces; dx <= spaces; dx++) {
      for (let dy = -spaces; dy <= spaces; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (Math.abs(dx) + Math.abs(dy) <= spaces) {
          const target = { x: unit.pos.x + dx, y: unit.pos.y + dy };
          if (!canLandOn(UNIT[warpingUnit.unitId].moveType, gameState.map, target) || occupiedByAnyUnit(gameState, target)) continue;
          if (!movementFlags.warpableTiles.some(tile => tile.x === target.x && tile.y === target.y)) {
            movementFlags.warpableTiles.push(target);
          }
        }
      }
    }
  }

  function handlePostCombatMovement(action, context) {
    const target = getTargetedUnits(context, action.target)[0];
    const { movementType } = action;
    const { gameState, unit } = context;
    const { unitDestination, targetDestination } = calculateMovementTypeDestinations(gameState, unit.pos, target, movementType);
    if (validateMovementTypeDestinations(gameState, unit, unitDestination, target, targetDestination, movementType)) {
      unit.pos = unitDestination;
      if (target.stats.hp > 0) {
        hashPos(gameState, target);
        target.pos = targetDestination;
        hashPos(gameState, target);
      }
    }
  }

  function minClone(gameState) {
    return {
      captureArea: deepClone(gameState.captureArea),
      currentTurn: gameState.currentTurn,
      duelState: deepClone(gameState.duelState),
      gameOver: gameState.gameOver,
      hash: gameState.hash,
      history: [],
      isSwapPhase: gameState.isSwapPhase,
      lastStartingTeam: gameState.lastStartingTeam,
      map: deepClone(gameState.map),
      mode: gameState.mode,
      teams: deepClone(gameState.teams),
      turnCount: gameState.turnCount,
      zobristTable: gameState.zobristTable
    }
  }

  const MAX_COORD = 10;
  const TABLE_SIZE = 65536;
  const HASH_EXACT = 0;
  const HASH_ALPHA = 0;
  const HASH_BETA = 0;
  const INFINITY = 50000;
  const WIN = 49000;
  const LOSE = -49000;
  const DRAW = 0;

  function search(gameState, depth) {
    if (gameState.gameOver) {
      console.warn("game over");
      return;
    }
    const searchInfo = {
      ply: 0,
      nodes: 0,
      fh: 0,
      fhf: 0,
      depth: 0,
      time: 2000,
      start: Date.now(),
      stop: false,
      best: null,
      score: 0,
      thinking: true,
      hashTable: new Array(TABLE_SIZE).fill().map(() => ({ hash: 0, move: null, score: 0, flag: HASH_EXACT, depth: 0 })),
      historyMoves: new Array((MAX_COORD * MAX_COORD - 1) * MAX_COORD * MAX_COORD + (MAX_COORD * MAX_COORD - 1) * MAX_COORD + (MAX_COORD * MAX_COORD - 1)).fill(0),
      killerMoves: [[], []]
    }
    let bestMove = null;
    let bestScore = -INFINITY;
    for (let currentDepth = 1; currentDepth <= depth; ++currentDepth) {
      bestScore = negamax(gameState, -INFINITY, INFINITY, currentDepth, searchInfo);
      if (searchInfo.stop) {
        break;
      }
      bestMove = getPvMove(searchInfo.hashTable, gameState.hash);
      const pvLine = getPvLine(searchInfo.hashTable, gameState, currentDepth);
      // let buffer = `d=${currentDepth},time=${Date.now() - searchInfo.start}ms,best=${getMoveString(gameState, bestMove)},score=${bestScore},nodes=${searchInfo.nodes},pv=${pvLine.join(" ")}`;
      // if (currentDepth !== 1) {
      //   buffer += `,ordering=${searchInfo.fh > 0 ? (100 * searchInfo.fhf / searchInfo.fh).toFixed(2) : 100}%`;
      // }
      // console.log(buffer);
    }

    searchInfo.best = bestMove;
    searchInfo.score = bestScore;
    searchInfo.thinking = false;
    return searchInfo;
  }

  function negamax(gameState, alpha, beta, depth, searchInfo) {
    if (gameState.gameOver) {
      const result = gameState.duelState[gameState.currentTurn].result;
      if (result === "win") return WIN - searchInfo.ply;
      if (result === "lose") return LOSE + searchInfo.ply;
      return DRAW;
    }
    if (depth <= 0) {
      return quiescence(gameState, alpha, beta, searchInfo);
    }
    if (((searchInfo.nodes & 1023) === 0) && (Date.now() - searchInfo.start) > searchInfo.time) { // try 511, 1023, 2047
      searchInfo.stop = true;
    }
    ++searchInfo.nodes;

    let score = -INFINITY;
    const hashEntry = getHashEntry(searchInfo.hashTable, gameState.hash, alpha, beta, depth);
    if (hashEntry && hashEntry.score !== null) {
      return hashEntry.score;
    }
    let moves = gameState.teams[gameState.currentTurn].flatMap(unit => generateActions(gameState, unit));
    moves.push({ type: "end turn" });
    moves = orderMoves(gameState, moves, searchInfo);
    // todo get pv move
    let movesChecked = 0;
    let oldAlpha = alpha;
    let bestMove = null;
    for (const move of moves) { // manual end turn is also an option
      const newGameState = minClone(gameState);
      executeAction(newGameState, move);
      ++movesChecked;
      ++searchInfo.ply;
      if (gameState.currentTurn === newGameState.currentTurn) {
        score = negamax(newGameState, alpha, beta, depth - 1, searchInfo)
      } else {
        score = -negamax(newGameState, -beta, -alpha, depth - 1, searchInfo);
      }
      --searchInfo.ply;
      if (searchInfo.stop) {
        return DRAW;
      }
      if (score > alpha) {
        if (score >= beta) {
          if (movesChecked === 1) {
            ++searchInfo.fhf;
          }
          ++searchInfo.fh; // use fhf / fh to get beta cutoff on first move percentage
          if (move.type !== "attack") {
            searchInfo.killerMoves[1][searchInfo.ply] = searchInfo.killerMoves[0][searchInfo.ply];
            searchInfo.killerMoves[0][searchInfo.ply] = move;
          }
          storeHashEntry(searchInfo, gameState.hash, move, beta, HASH_BETA, depth); // causing ordering to go down
          return beta;
        }
        if (move.type !== "attack" && move.type !== "end turn") {
          searchInfo.historyMoves[encodeMove(move)] += depth * depth;
        }
        alpha = score;
        bestMove = move;
      }
    }
    if (alpha !== oldAlpha) {
      storeHashEntry(searchInfo, gameState.hash, bestMove, score, HASH_EXACT, depth);
    } else {
      storeHashEntry(searchInfo, gameState.hash, bestMove, alpha, HASH_ALPHA, depth);
    }
    return alpha;
  }

  function quiescence(gameState, alpha, beta, searchInfo) {
    if (gameState.gameOver) {
      const result = gameState.duelState[gameState.currentTurn].result;
      if (result === "win") return WIN - searchInfo.ply;
      if (result === "lose") return LOSE + searchInfo.ply;
      return DRAW;
    }
    if (((searchInfo.nodes & 511) === 0) && (Date.now() - searchInfo.start) > searchInfo.time) { // try 1023, 2047
      searchInfo.stop = true;
    }
    ++searchInfo.nodes;

    let score = evaluate(gameState);
    if (score >= beta) {
      return beta;
    }
    if (score > alpha) {
      alpha = score;
    }
    let moves = gameState.teams[gameState.currentTurn].flatMap(unit => generateKoActions(gameState, unit));
    moves = orderMoves(gameState, moves, searchInfo);
    let movesChecked = 0;
    let oldAlpha = alpha;
    let bestMove = null;
    for (const move of moves) {
      const newGameState = minClone(gameState);
      executeAction(newGameState, move);
      ++movesChecked;
      ++searchInfo.ply;
      if (gameState.currentTurn === newGameState.currentTurn) {
        score = quiescence(newGameState, alpha, beta, searchInfo)
      } else {
        score = -quiescence(newGameState, -beta, -alpha, searchInfo);
      }
      --searchInfo.ply;
      if (searchInfo.stop) {
        return DRAW;
      }
      if (score > alpha) {
        if (score >= beta) {
          if (movesChecked === 1) {
            ++searchInfo.fhf;
          }
          ++searchInfo.fh;
          return beta;
        }
        alpha = score;
        bestMove = move;
      }
    }
    if (alpha !== oldAlpha) {
      storeHashEntry(searchInfo, gameState.hash, bestMove);
    }

    return alpha;
  }

  function evaluate(gameState) {
    let score = gameState.duelState[0].koScore + gameState.duelState[0].captureScore
      - gameState.duelState[1].koScore - gameState.duelState[1].captureScore;
    score *= 100;
    const captureAreaBonus = 20; // score for being in capture area
    const distanceFactor = 5;    // score subtracted for each space away
    gameState.teams.forEach((team, i) => {
      team.forEach(unit => {
        const distance = distanceFromCaptureArea(gameState, unit.pos);
        score += (captureAreaBonus - distance * distanceFactor) * (i === 0 ? 1 : -1);
      });
    });
    return gameState.currentTurn === 0 ? score : -score;
  }

  function orderMoves(gameState, moves, searchInfo) {
    const pvMove = getPvMove(searchInfo.hashTable, gameState.hash);
    for (const move of moves) {
      if (actionEquals(move, pvMove)) {
        move.score = 2000;
      } else if (move.type === "attack") {
        move.score = 1000;
      } else if (actionEquals(move, searchInfo.killerMoves[0][searchInfo.ply])) {
        move.score = 900;
      } else if (actionEquals(move, searchInfo.killerMoves[1][searchInfo.ply])) {
        move.score = 800;
      } else if (move.type === "assist") {
        move.score = 700;
      } else if (move.type === "end turn") {
        move.score = 0;
      } else {
        // todo encoding doesn't know the unit might need to rethink this
        move.score = searchInfo.historyMoves[encodeMove(move)];
      }
    }
    return moves.sort((a, b) => b.score - a.score);
  }

  function encodeMove(move) {
    const fromIndex = encodePos(move.from);
    const toIndex = encodePos(move.to);
    const targetIndex = move.target ? encodePos(move.target) : null;
    return fromIndex * (MAX_COORD * MAX_COORD) + toIndex * MAX_COORD + (targetIndex || 0);
  }

  function encodePos(pos) {
    return pos.x * MAX_COORD + pos.y;
  }

  function getPvLine(table, gameState, depth) {
    const clone = minClone(gameState);
    const line = [];
    let move = getPvMove(table, clone.hash);
    let count = 0;
    while (move && count < depth) {
      if (isValidAction(clone, move)) {
        line.push(getMoveString(clone, move));
        executeAction(clone, move);
      } else {
        break;
      }
      move = getPvMove(table, clone.hash);
    }
    return line;
  }

  function getPvMove(table, hash) {
    const index = hash & (TABLE_SIZE - 1);
    if (table[index].hash === hash) {
      return table[index].move;
    }
    return null;
  }

  function getHashEntry(table, hash, alpha, beta, depth) {
    const index = hash & (TABLE_SIZE - 1);
    if (table[index].hash === hash) {
      let score = null;
      if (table[index].depth >= depth) {
        score = table[index].score;
        const flag = table[index].flag;
        if (flag === HASH_ALPHA && score <= alpha) {
          score = alpha;
        } else if (flag === HASH_BETA && score >= beta) {
          score = beta;
        }
      }
      return {
        move: table[index].move,
        score
      };
    }
    return null;
  }

  function storeHashEntry(searchInfo, hash, move, score, flag, depth) {
    const { hashTable: table, ply } = searchInfo;
    const index = hash & (TABLE_SIZE - 1);
    // todo WIN - ply or LOSE + ply

    if (table[index].hash === 0 || table[index].depth <= depth) {
      table[index].hash = hash;
      table[index].move = move;
      table[index].score = score;
      table[index].flag = flag;
      table[index].depth = depth;
    }
  }

  function getMoveString(gameState, move) {
    if (move.type === "end turn") {
      return "ET";
    }
    const { from, to, target } = move;
    const unit = findUnitAtPosition(gameState, from);
    const { x: fromX, y: fromY } = from;
    const { x: toX, y: toY } = to;
    let movement = '';
    if (toY < fromY) movement += `${fromY - toY}U`;
    if (toY > fromY) movement += `${toY - fromY}D`;
    if (toX < fromX) movement += `${fromX - toX}L`;
    if (toX > fromX) movement += `${toX - fromX}R`;
    if (toX === fromX && toY === fromY) movement = "0";
    let targetInfo = '';
    if (target) {
      const { x: targetX, y: targetY } = target;
      if (gameState.map.blocks.find(b => b.x === targetX && b.y === targetY)) {
        targetInfo = "Block";
      } else {
        const targetUnit = findUnitAtPosition(gameState, target);
        if (targetUnit) {
          targetInfo = `${targetUnit.unitId}`;
        }
      }
    }
    let moveDescription = `${unit.unitId}:${movement}`;
    if (targetInfo) {
      moveDescription += `→${targetInfo}`;
    }
    return moveDescription;
  }

  function findUnitAtPosition(gameState, pos) {
    return gameState.teams[0].concat(gameState.teams[1]).find(unit => unit.pos.x === pos.x && unit.pos.y === pos.y);
  }


  return {
    validateBuild,
    validateTeam,
    newGame,
    debug,
    calculateMovementRange,
    calculateThreatRange,
    generateActions,
    isValidAction,
    actionEquals,
    executeAction,
    swapStartingPositions,
    endTurn,
    surrender,
    endSwapPhase,
    enterSwapPhase,
    calculateCombatResult,
    search
  }
}

export default Engine;
