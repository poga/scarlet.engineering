---
title: "Making a Simulation game - Part 1: The Engine"
date: 2026-06-30
description: How does a simulation game actually work?
image: https://scarlet.engineering/blog/images/brews_and_kings_building_menu.png
---

![](/blog/images/brews_and_kings_building_menu.png)

Before I knew much about game development, I already knew I wanted to make simulation/strategy games.

But. There's just not much information on the internet about making a simulation game. This is what I learned.

---

## You can't make a simulation game without studying SimCity.

The first reference is the GlassBox engine behind SimCity. Here's a 14-year-old video on how it works.

<iframe width="560" height="315" src="https://www.youtube.com/embed/MxTcm1YFKcU?si=I3ls2431bn0DFtzY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

It's old (from 2012!), but most of the ideas still hold up:

1. Everything on the map is a building (unit).
    1. Buildings store resources.
    2. Buildings run rules. Rules trigger effects and animations.
2. A map defines resources and building distributions.
3. Agents are the simulation entities that bring resources from one building to another.
4. Agents trigger simulation rules when they arrive at their destination, but no rule runs during transit.
5. Zones run rules to create buildings.

Examples:
1. A request arrives at a house -> a car spawns and looks for work.
2. A worker arrives at a factory -> the factory turns on and starts producing goods and air pollution.
3. An agent (truck) moves resources to another building.

---

## Against the Storm: Physicality

Another huge inspiration for simulation/strategy games is [Against the Storm](https://store.steampowered.com/app/1336490/Against_the_Storm/). IMO the most inspiring one in recent years.

[![](/blog/images/against_the_storm_gdc.png)](https://gdcvault.com/play/1034422/-Against-the-Storm)

The key concept is **Physicality**. A persistent actor that exists in world space. Walks paths between buildings, stands at one, performs timed work. Where Agent is a flow event with a speed, PhysicalAgent is a thing in the world: a worker, a cargo truck, a courier.

Abstract agents from a SimCity-style engine are one-shot, ephemeral, interchangeable flow events. They do their job (move a resource from A to B) and then disappear. This lets the game scale while keeping good performance.

Physical Agents have needs that flow events don't:
- positioning (dispatch_move),
- stationary labor (dispatch_work),
- state across many ticks,
- and view-layer interpolation along a path.

Modeling them with bare Agents is fragile. We end up bolting motion, animation, and persistent state onto a primitive built to be a one-shot event, and the resource ledger absorbs what is really view state.

Physical Agents also make the game more intuitive. The player sees them moving around the map. All of these are natural:

- long-distance traveling = slow
- lots of agents waiting near a building = bottleneck

Games like [Mini Motorways](https://store.steampowered.com/app/1127500/Mini_Motorways/) have mastered this technique. Everything the player needs to know is clearly visible on screen. No charts, no numbers.

---

## Implementing in Godot

My implementation mostly follows their ideas.

**Everything is agents moving resources between buildings**. That's the only verb the engine knows.

Wood reaching a construction site, beer reaching a town order, water filling a well, power lighting a district, pollution drifting downwind, happiness radiating from a park. All the same shape: an agent ferries a resource bundle from one Building to another.

While doing so, a few more benefits emerged:

1. Clean engine/content separation:
    - The engine focuses on simulating agents efficiently.
    - The content side can focus on design: what the buildings/resources/agents are, how they flow, and how it should be fun.
    - Each building is an isolated scene tree (in Godot's terms). They compose and interact with each other cleanly.
2. The model is basically double-entry bookkeeping. Every resource movement is a transaction that can be verified to keep the books balanced. This lets me catch subtle simulation bugs easily and debug game sessions via logs.
3. Determinism: the whole engine can be made deterministic if you want.

