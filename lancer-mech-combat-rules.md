Lancer Combat Rules (Implementation-Oriented)

This document extracts the mech-combat rules you’ll need to implement a JavaScript Lancer combat engine. It focuses on state, sequencing, legal actions, targeting, resolution, and effects. Reference tables are paraphrased into rule logic.

⸻

1) Core Concepts and Entities
	•	Characters vs. Objects. A character is anything that can act or react independently (PCs, NPCs, drones, turrets). An object is terrain or deployable gear not held/worn (e.g., walls, shield generators). You are never “allied to yourself.”
	•	Spaces & Size. Distances use spaces (default ≈10 ft / 3 m). SIZE measures footprint/height in spaces. SIZE 1 mech occupies 1×1×1; pilots are SIZE 1/2 (both occupy 1×1 on a grid). SIZE reflects control/footprint, not exact height.

⸻

2) Combat Flow
	•	Starting/Ending Combat. GM declares start (typically after hostile moves). End when an objective is achieved; surrender/retreat are valid outcomes.
	•	Rounds & Turns (Side-based initiative). Players choose a first acting ally; then sides alternate (ally → hostile → ally …). Next round continues alternating; some rounds may start with hostiles. Each character gets one turn per round.
	•	Action Economy (per turn). One standard move + either two quick actions or one full action. You can take any number of free actions on your turn (those granted to you), and one reaction per turn (yours or another’s turn). You may OVERCHARGE once/turn for an extra quick action as a free action (heat cost escalates: 1, 1d3, 1d6, 1d6+4 until Full Repair).
	•	Resolution Ordering. Effects from other characters resolve first during your turn; otherwise, you choose order of your simultaneous start/end-of-turn effects. “End of next turn” means your next turn in order.

⸻

3) Movement & Position
	•	Standard Move. Move up to SPEED; diagonal allowed; you only “moved” if you entered ≥1 space. You can split movement around actions, but each non-move action must fully resolve before further moving (e.g., move 4 → Barrage → move 2).
	•	Adjacency & Obstruction. Adjacent = within 1 space (including diagonal/vertical). Obstructions block entry; you can pass through smaller obstructions and allies, but can’t end in an occupied space. Allies never obstruct, but you still can’t end in their space.
	•	Engagement. Becoming adjacent to a hostile makes both characters ENGAGED while adjacent. ENGAGED imposes +1 Difficulty on an ENGAGED character’s ranged attacks, and movement during which you become ENGAGED by a target of equal/greater SIZE immediately stops (unused movement lost). After becoming ENGAGED, you can take later moves normally (but may trigger reactions when leaving/starting in THREAT).
	•	Movement & Reactions. Starting a movement in another’s THREAT (often 1–3) can trigger reactions (e.g., OVERWATCH). DISENGAGE (full) ignores engagement and reactions for the rest of that turn.
	•	Involuntary Movement. Push/pull/knockback in a straight specified line; does not provoke engagement/reactions (unless specified). Blocked by obstructions.
	•	Difficult/Dangerous Terrain. Difficult terrain costs ×2 movement per space. Dangerous terrain: on entering or ending turn there, make ENGINEERING check or take 5 damage (type by hazard). One such check max per round.
	•	Lift/Drag. Drag up to 2× your SIZE (you are SLOWED). Lift equal/smaller SIZE overhead (you are IMMOBILIZED). No reactions while dragging/lifting. Pilots (on foot) can’t drag/lift above SIZE 1/2.
	•	Jump/Climb/Fall.
	•	Jump (instead of standard move): horizontal = half SPEED in straight line, ignoring ground-level gaps; vertical = 1 adjacent space up to height = your SIZE; if you end mid-air, you fall at end of move. Climb at half SPEED; GM may call for HULL/AGILITY check.
	•	Falling (≥3 spaces): 3 AP per 3 spaces fallen (max 9 AP); start falling at end of current turn, then at end of each of your turns; mechs don’t fall in zero/low-G.
	•	Gravity & Flight. In water/zero-G/space, mechs are SLOWED unless they have propulsion/flight; can’t fall; may move as flying. Flying: move up to SPEED in a straight line; ignore obstructions physically possible to avoid; immune to PRONE. Must move ≥1 space/turn while flying; begin falling if IMMOBILIZED/STUNNED or on failed AGILITY save after structure/stress. Stay within 10 spaces above a surface to act normally (else only move/BOOST; no reactions until back under the limit). Hover: no straight-line constraint; can stay stationary. Carry limits while flying: cannot carry total SIZE > 1/2 (non-zero-G).
	•	Teleport. Instant movement to a free space within range; must start/end on a normally moveable surface; ignores obstructions, engagement, and reactions; still counts as “moved 1 space.” If destination occupied, the teleport fails.

⸻

4) Targeting, Line of Sight, Patterns, Cover
	•	Valid Targets. Other characters, unattended objects, or spaces. Default targeting requires appropriate RANGE/THREAT/SENSORS and line of sight (LoS).
	•	Line of Sight / Line of Effect. You must be able to trace a line to some part of the target through an unobstructed path. ARCING weapons can lob without LoS (still affected by cover, must be physically possible). SEEKING ignores LoS and cover if physically possible to reach.
	•	RANGE & THREAT. RANGE measured from any edge of attacker; target must be at least 1 space inside RANGE. THREAT is the max range for melee and for OVERWATCH reactions; defaults to 1 unless modified.
	•	Patterns. LINE X, CONE X, BLAST X, BURST X. Separate attack roll per target; roll damage once; bonus damage is halved if multiple targets are hit. Some patterns list a RANGE, meaning you pick an origin point within that RANGE and LoS, then apply the AoE from there. Frame/system RANGE increases don’t change pattern size.
	•	Cover.
	•	Soft cover (smoke, foliage, etc.) imposes +1 Difficulty on ranged attacks.
	•	Hard cover (walls, wrecks) imposes +2 Difficulty on ranged attacks if the target is adjacent to the cover and not flanked relative to the attacker. Only one type of cover applies at once. Characters usually don’t grant cover unless specified (e.g., GUARDIAN). Flanking negates hard cover from that source if the attacker’s line crosses the “contact line” on that side. (Implementers: you’ll need a geometric test for adjacency to hard cover and a flanking test.)
	•	Hidden/Invisibility. INVISIBLE: every attack has a 50% miss chance before rolling; INVISIBLE characters can always HIDE (unless ENGAGED). HIDE requires not ENGAGED and either out of LoS, sufficient cover, or INVISIBLE; gives HIDDEN status (can’t be directly targeted; can be hit by area effects). HIDDEN drops after attacking, forcing saves, taking reactions/BOOST, or losing cover/visibility. SEARCH can reveal and remove HIDDEN.

⸻

5) Attacks & Rolls
	•	Attack Types. Melee, Ranged, Tech. Melee and Ranged use d20 + GRIT ± Accuracy/Difficulty vs EVASION; Tech uses d20 + TECH ATTACK ± Acc/Diff vs E-DEFENSE. Melee and Tech ignore cover; Ranged suffers cover penalties and +1 Difficulty if ENGAGED. A natural 20+ on melee/ranged is a critical: roll all damage dice twice (including bonus damage) and keep the highest from each source.

Note: The PDF references Accuracy/Difficulty but does not define their die handling here; implement according to your system module that interprets Lancer’s Acc/Diff mechanics.

⸻

6) Harm Model: Damage, Heat, Immunities
	•	Damage Types. Kinetic, Energy, Explosive, and Burn.
	•	Armor & Resistance. ARMOR reduces damage from a single source by its rating (1–4); AP and Burn ignore ARMOR. RESISTANCE halves specified damage/heat (after ARMOR); it doesn’t stack.
	•	Damage Calculation Order. (1) Roll/modify damage (e.g., doubled by EXPOSED). (2) Subtract ARMOR. (3) Apply RESISTANCE/other reductions. (4) Subtract from HP.
	•	Burn (ongoing). On hit: immediately take the listed Burn (ignores ARMOR) and mark that burn. End of your turn: ENGINEERING check—on failure take damage equal to total marked Burn; on success, clear all Burn. New sources add to marked total.
	•	Heat. Heat is harm to a mech’s reactor/systems; it ignores ARMOR, can be affected by RESISTANCE, and fills HEAT CAP. BIOLOGICAL/DRONEs without HEAT CAP take Energy damage instead.
	•	Bonus Damage. Only for melee/ranged; type is Kinetic/Energy/Explosive (defaults to Kinetic if unspecified, or choose a type matching the weapon). Halve bonus damage if the attack hits multiple characters.
	•	Immunity. Full ignore of specified damage/effects (not just reduced to 0).
	•	Object Defaults. Unless specified: objects have EVASION 5 and HP = 10 per SIZE; tough materials may have 1–2 ARMOR, fortified 3–4. GM may waive outside mech combat.

⸻

7) Actions (Quick/Full/Free/Other)

Quick Actions
	•	BOOST. Move up to SPEED (extra movement separate from standard move). Some effects key off BOOST specifically.
	•	GRAPPLE (melee attack). On hit: both become ENGAGED; no BOOST or reactions; smaller becomes IMMOBILIZED and moves mirroring the larger. If same SIZE, contested HULL at start of turn to determine who counts as larger this round. Ends if adjacency breaks, attacker ends it (free), or defender uses quick action for contested HULL to break free. Multi-grapples sum allied SIZE.
	•	RAM (melee attack). Target (adjacent, same SIZE or smaller): on hit, knocked PRONE; optionally knock back 1 space directly away.
	•	HIDE. If not ENGAGED and either outside all enemy LoS, sufficiently obscured (hard cover that totally conceals; soft cover only if completely inside an obscuring zone), or INVISIBLE → gain HIDDEN. HIDDEN prevents direct targeting; breaks on attack/forced save/BOOST/reaction/cover loss/visibility changes.
	•	QUICK TECH (repeatable per turn, different option each time).
	•	Bolster: Ally within SENSORS gets +2 Accuracy on their next check or save before end of their next turn (max one Bolster at a time).
	•	Lock On: Mark target within SENSORS+LoS with LOCK ON; any attacker may consume it for +1 Accuracy on an attack vs that target (then clear the mark).
	•	Scan: Ask for target’s full stat block/equipment, or one hidden fact, or public record (model number, etc.). Info is snapshot-time only.
	•	Invade (tech attack): On hit, target takes 2 Heat and you pick an INVADE effect (default Fragment Signal: target becomes IMPAIRED and SLOWED until end of its next turn). Invading a willing ally auto-succeeds, isn’t an attack, and doesn’t deal Heat.
	•	SEARCH. Contest SYSTEMS vs target’s AGILITY (within SENSORS) to reveal HIDDEN; pilots on foot contest a skill check within RANGE 5. Revealed target immediately loses HIDDEN.
	•	SKIRMISH. Attack with one weapon; you may also fire a different AUXILIARY on the same mount (no bonus damage). SUPERHEAVY can’t be fired in SKIRMISH.

Full Actions
	•	BARRAGE. Attack with two weapons, or fire one SUPERHEAVY. Also may fire an AUXILIARY on each fired mount (no bonus damage).
	•	FULL TECH. Choose two QUICK TECH options (may repeat the same option) or one FULL-TECH-tagged system.
	•	IMPROVISED ATTACK. Melee attack vs adjacent; on hit 1d6 Kinetic.
	•	STABILIZE. Choose one primary: (a) clear all Heat and EXPOSED; or (b) mark 1 REPAIR to restore all HP. Then choose one auxiliary: reload all LOADING weapons; or clear all current Burn; or clear one (non-self-inflicted) condition on self or adjacent ally.
	•	DISENGAGE. Until end of current turn you ignore engagement; your movement doesn’t provoke reactions.
	•	SKILL CHECK (Full). GM calls for this only for sufficiently involved activities; quick/simple tasks require no action. (Engine support: flexible check pipeline.)

Other / Special
	•	ACTIVATE (Quick/Full). Use a system/gear with matching action tag; can use multiple different systems per turn, but not the same one twice unless granted as a free action.
	•	SHUT DOWN (Quick). Power off: immediately clear all Heat and EXPOSED; end tech statuses/conditions (e.g., LOCK ON); gain IMMUNITY to all tech actions/attacks; become STUNNED indefinitely until BOOT UP (Full).
	•	MOUNT/DISMOUNT/EJECT. Mount/dismount (Full) requires adjacency; dismount must place pilot in adjacent free space. EJECT (Quick): pilot flies 6 spaces, mech becomes IMPAIRED; cannot EJECT again until Full Repair.
	•	SELF-DESTRUCT (Quick). Arm a meltdown: at end of your next turn (or either of the two following turns, your choice), explode BURST 2 for 4d6 Explosive (AGILITY save half), then mech is destroyed.
	•	PREPARE (Quick). Hold a quick action with a trigger “When X, then Y” usable as a reaction before your next turn starts. While holding, you cannot move/act/react (you can drop the prepared action to resume reactions). Must respect the original action’s restrictions (e.g., ORDNANCE before movement). If not triggered, it’s lost.

Free Actions & Protocols
	•	Free actions: unlimited on your turn if granted.
	•	Protocols: free-action toggles at start of your turn; each protocol max once/turn.

Reactions (defaults available to all mechs)
	•	OVERWATCH (1/round). Trigger: a hostile starts any movement inside one of your weapons’ THREAT. Effect: immediately SKIRMISH with that weapon before they move.
	•	BRACE (1/round). Trigger: you’re hit and damage is rolled. Effect: gain RESISTANCE to all damage/Heat from that attack; until end of your next turn, attacks vs you are at +1 Difficulty. After bracing: no reactions until end of your next turn; on that next turn, you may take only one quick action (no move, Full, Free, or Overcharge).
	•	Limits. One reaction per turn (yours or others’), but multiple per round if you regain uses.

⸻

8) Statuses & Conditions (apply effects as pure state)

Statuses
	•	ENGAGED (see Movement). Ranged attacks by an ENGAGED character: +1 Difficulty; becoming ENGAGED by equal/greater SIZE during movement stops movement.
	•	EXPOSED (mechs only). Double incoming Kinetic/Energy/Explosive damage (before reductions). Cleared by STABILIZE (primary heat-cool option).
	•	HIDDEN. Can’t be targeted directly; enemies only know approximate location; breaks on attack/forced save/BOOST/reaction/cover+LoS change. Search reveals.
	•	INVISIBLE. 50% miss chance before attack roll; can always HIDE (unless ENGAGED).
	•	PRONE. Attacks vs PRONE targets get +1 Accuracy; PRONE targets are SLOWED and treat movement as difficult terrain; stand up instead of standard move (doesn’t count as movement).
	•	SHUT DOWN (mechs only). On SHUT DOWN: clear Heat/EXPOSED; end tech statuses; IMMUNITY to tech; but you are STUNNED indefinitely until BOOT UP.
	•	DANGER ZONE (mechs only). Heat ≥ 50% of HEAT CAP. Enables some effects.
	•	DOWN AND OUT (pilots only). Unconscious & STUNNED; further damage kills; recover on rest with half HP.

Conditions
	•	IMMOBILIZED: no voluntary movement.
	•	IMPAIRED: +1 Difficulty on all attacks/saves/checks.
	•	JAMMED: no comms; may only make IMPROVISED ATTACK/GRAPPLE/RAM; no reactions; no taking/benefitting from tech actions.
	•	LOCK ON: hostile may consume it for +1 Accuracy on a single attack vs that target. (Some talents/systems require a LOCK ON state.)
	•	SHREDDED: no benefit from ARMOR or RESISTANCE.
	•	SLOWED: may only make standard move on own turn; no BOOST or special movement.
	•	STUNNED (mechs). Cannot move, Overcharge, or take actions/reactions/free actions; EVASION max 5; automatically fail HULL/AGILITY checks/saves. Pilots can still mount/dismount/eject and act as normal on foot.

⸻

9) Structure, Stress, Overheat, Destruction

Your engine should implement these three separate “catastrophe tracks”: HP → STRUCTURE checks, Heat → STRESS checks, and final destruction/meltdown.

Structure (HP track)
	•	When a mech’s HP ≤ 0 from damage, it loses 1 STRUCTURE immediately. If STRUCTURE remains ≥1, roll a Structure Check (1d6) and apply the result; if STRUCTURE hits 0, the mech is destroyed. Some effects cause rolling twice and taking the worse.
	•	Structure Check outcomes (rules):
	•	1 – Direct Hit: Roll a 1d6; on 1–3 you are STUNNED until end of next turn; on 4–6 you are IMPAIRED and SLOWED until repaired (Stabilize can clear conditions).
	•	2–4 – System Trauma: DESTROY one Mounted Weapon or System (attacker’s choice if hostile, else your choice); if none remain, take 1d6 Kinetic instead.
	•	5–6 – Glancing Blow / Emergency Shunt: No additional effect beyond losing STRUCTURE.
	•	Multiple 1s in one roll window – Crushing Hit: Immediately take another Structure Check (this stacks).

Stress / Overheating (Heat track)
	•	When Heat ≥ HEAT CAP, the mech Overheats: lose 1 STRESS and roll an Overheat Check (1d6); if STRESS hits 0, a Reactor Meltdown is triggered (see below).
	•	Overheat Check outcomes (rules):
	•	1 – Meltdown Imminent: Reactor Meltdown in 1d6 turns unless a Stabilize (cool) or shutdown fixes it.
	•	2–3 – System Overload: You become EXPOSED; also JAMMED until end of your next turn.
	•	4–5 – Emergency Vent: Take 1d6 Energy damage ignoring ARMOR and clear Heat to just below cap.
	•	6 – Emergency Shunt: Minimal effect; clear Heat to just below cap.

Reactor Meltdown (final)
	•	On meltdown resolution (self-destruct or meltdown timer expires): BURST 2, 4d6 Explosive; AGILITY save for half; the mech is destroyed.

⸻

10) Overcharge (heat-for-tempo)
	•	Once/turn you may OVERCHARGE: gain one quick action as a free action. Heat cost escalates per scene until Full Repair: 1, 1d3, 1d6, 1d6+4. Reset at Full Repair.

⸻

11) Pilots in Mech Combat
	•	Piloting & Line of Sight Shielding. Pilot must be inside the mech to control it; powered-off mechs are SHUT DOWN. Pilot has no LoS to outside (and vice-versa) while inside an intact mech. If piloting an unlicensed mech: the mech is IMPAIRED and SLOWED.
	•	Pilot Stat Defaults: HP 6 + GRIT; EVASION 10; E-DEFENSE 10; SIZE 1/2; SPEED 4; ARMOR 0.
	•	On Foot (vs mechs). Pilots add GRIT to attacks/saves (not triggers), have BIOLOGICAL tag (IMMUNE to tech actions except LOCK ON and SCAN), and if they’d take Heat they take Energy damage instead. Pilots neither ENGAGE mechs nor obstruct them.
	•	Pilot Actions: Use the same pool (move + two quick / one full). Can mix pilot+mech actions in a turn (e.g., SKIRMISH in mech, EJECT, then move on foot). Pilots can BOOST, HIDE, SEARCH, ACTIVATE, SKILL CHECK, DISENGAGE, PREPARE, MOUNT; may OVERWATCH (using FIGHT). Unique: FIGHT (Full) one weapon attack; JOCKEY (Full) climb an adjacent mech (contest GRIT vs mech’s HULL) then each turn pick one: DISTRACT (IMPAIRED & SLOWED), SHRED (2 Heat), or DAMAGE (4 Kinetic); RELOAD (Quick) a LOADING pilot weapon.

⸻

12) Quick Implementation Notes
	•	State you’ll track per character: position (space), SIZE, SPEED, EVASION, E-DEFENSE, GRIT, Mech Skills (HULL/AGILITY/SYSTEMS/ENGINEERING) for checks/saves, HP, STRUCTURE, HEAT, STRESS, REPAIR CAP, ARMOR, RESISTANCE flags, current statuses/conditions, current reactions/free actions remaining, THREAT/RANGE by weapon, SENSORS, LOCK ON marks, HIDDEN/INVISIBLE states, mounted weapons/systems (for destruction via System Trauma).
	•	Geometry: adjacency in 3D grid (including vertical); cover/flanking line tests; pattern tiling (LINE/CONE/BLAST/BURST).
	•	Timers: prepare-held actions; end-of-turn triggers (burn, flight fall, meltdown countdown); “until end of next turn” windows.
	•	Reaction constraints: one reaction per turn; per-round use limits (e.g., 1/round) refresh at start of your next turn.

⸻

13) Glossary (engine-level handles)

Key values referenced by multiple rules: ARMOR, BONUS DAMAGE, DAMAGE, E-DEFENSE, EVASION, GRIT, HEAT, HEAT CAP, HP, IMMUNITY, RANGE, REPAIR CAP, RESISTANCE.

⸻

Final Note

The combat engine should pass through die modifiers (Accuracy/Difficulty) from a core roller module and apply target defenses and condition/cover rules described above. If you want, I can add a slim “dice/Acc-Diff” module scaffold next.
