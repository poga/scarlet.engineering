---
title: Curves of Fun
date: 2026-02-14
description: Handy functions for designing number scaling in games
image: https://scarlet.engineering/logo-v2.png
---

Notes of [Advanced Game Design: A Systems Approach](https://www.amazon.com/Advanced-Game-Design-Systems-Approach/dp/0134667603) by Michael Sellers.

Charts are made with Python and Matplotlib.

---

Games need goals. and the journey of achieving the goals needs to be fun.

## The Goal

The goal, e.g. dps required, xp required to level up, etc... is usually an exponential function of the level. They make early levels seem attainable and players go through them fast, while later ones seem at first to be so far off numerically as to almost require superhuamn abilities to reach.

By the time the players start reaching these levels, however, they are also gaining astronomical numbers of experience points, so they feel a continuing sense of achievement in both their individual victories (the numeric rewards do not seem paltry) and in their overall number of experience points gained.

Usually we can just straight up copy the OSRS's exp formula:

**E(L) = ⌊(1/4) × Σ(x=1 to L−1) ⌊x + 300 × 2^(x/7)⌋⌋**,

which is an exponential function with base ~= 1.1041.

![](/blog/images/osrs_exp.png)

## The fun is how the player reach the goal

The player's power/efficiency increase is usually a quadratic polynomial. The gap the goal and the efficiency is where the tension comes from: every level gets a bit harder to reach, but the player also gets more powerful. The player is always making progress, but the goal is always just out of reach.

![](/blog/images/progression.png)

However, if we only have one polynomial, then there's no decision to be made: the player just keeps doing the same thing over and over again, and the game becomes boring.

Sigmoid/hyperbolic scaling functions comes in handy. They create sub-goals. Each progression method(a level up zone, a crafting recipe, skill unlocks, quest tiers, etc...) can be designed to be the most efficient way to progress for a certain range of levels. The gameplay now have rhythm and variety, and the player can choose which method to use based on their preferences.

![](/blog/images/sigmoid.png)

They're also a powerful tools for narrative design. Mastering a sub-goal (e.g. a crafting recipe) can provides an additonal bonus to the player. QOL, aesthetic,unlock new content, etc... They naturally open new decisions for the player and expand the world.

Maybe there's a grandmaster quest that requires multiple goals to be reached to solve. or the player needs a certain level of crafting to unlock a new area. The new area needs a certain level of combat to survive. Fighting monsters in the new area gives you a rare materials that can be used for more efficient weapon-smithing... etc. They're all interlinked, and the player's decisions on which sub-goal to pursue will affect their overall progression and experience in the game.

## Analyzing the curves

The curves are also helpful for seeing the overall balance of the progression of the game.

![](/blog/images/analyze.png)

You can see the pacing of the game, the difficulty spikes, the efficiency of different methods, etc... Is a new sigmoid needed for level 30-50 because there's no meaningful decision to be made in that range? Is the early game too easy because the player can just grind one method for a long time? Are there any bottlenecks that prevent the player from reaching the later levels?

---

All of these are over-simplifications, of course. Pretty handy tho.
