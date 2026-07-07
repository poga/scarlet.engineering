---
title: "Making a Simulation Game - Part 2: The Engine Doesn't Know What Beer is"
date: 2026-07-06
description: How does my simulation game work?
image: https://scarlet.engineering/blog/images/post2.png
---

<figure style="display: flex; flex-wrap: wrap; gap: 16px; margin: 0;">
  <span style="flex: 1 1 320px; margin: 0;">
    <video autoplay loop muted playsinline poster="/blog/images/post2_engine.png" style="width: 100%; height: auto;">
      <source src="/blog/images/post2_engine.mp4" type="video/mp4">
    </video>
    <figcaption>What the engine sees.</figcaption>
  </span>
  <span style="flex: 1 1 320px; margin: 0;">
    <video autoplay loop muted playsinline poster="/blog/images/post2_player.png" style="width: 100%; height: auto;">
      <source src="/blog/images/post2_player.mp4" type="video/mp4">
    </video>
    <figcaption>What the player sees.</figcaption>
  </span>
</figure>

In [part 1](/blog/making-simulation-game-part-1-the-engine/) I said everything is agents moving resources between buildings.

This post is what happens when you take that literally: **the engine that runs my game does not know what beer is**. It routes agents and balances books. Every noun lives somewhere else.

---

## The Layers

The game consists of three layers: View, Engine, and Content.

1. The player only interacts with the view.
2. The engine knows nothing about the content. All it knows is **agents moving resources between buildings**.
3. Content scripts decide what kind of game this is. It just happens to be a medieval brewery game.

```mermaid
sequenceDiagram
    participant Player
    participant View as View<br/>(scenes/, UI)
    participant Engine as Engine<br/>(EngineRuntimeManager)
    participant Content as Content<br/>(buildings, orders, policies)

    Player->>View: input (click, hotkey)
    View->>Engine: submit_command(cmd)
    Note right of View: view never mutates sim state —<br/>commands are the only door

    rect rgb(128, 128, 128, 0.1)
        Note over Engine,Content: _tick_once() — same loop every tick, 20 Hz
        Engine->>Engine: apply queued commands
        Engine->>Content: on_receive() — agent arrivals deposit resources
        Engine->>Content: on_physical_agent_arrived() — workers land
        Engine->>Content: on_tick() — every enabled building
        Engine->>Content: tick policies (Workforce, Orders, Quests, …)
        Content-->>Engine: engine verbs only<br/>(spawn_agent, dispatch_*, consume_buffer)
        Content-->>Engine: queue_event(name, args)
        Engine->>Engine: tick_number++
    end

    Engine-->>View: flush event queue (signals)
    View-->>Player: render game state
```

---

## The Simulation Tick

The engine runs at 20 Hz, framerate-independent.

Each tick, it runs one deterministic iteration.

```mermaid
flowchart TB
    c1["1 · apply queued commands"] --> c2["2 · deliver Agent arrivals"]
    c2 --> c3["3 · advance every PhysicalAgent"]
    c3 --> c4["4 · pre-building policies (stats)"]
    c4 --> c5["5 · building.on_tick — all enabled"]
    c5 --> c6["6 · post-building policies<br/>Workforce · Factions · Quests · Orders · Relics"]
    c6 --> c7["7 · game hook — _post_policy_tick"]
    c7 --> c8["8 · queue sim_tick events, tick++"]
    c8 --> c9["9 · flush event queue"]
    c3 -. "a PA landing IDLE is dispatchable this same tick" .-> c5
```

---

## Verbs in, Events out

The player never interacts with the engine directly. They always send **commands** through the view to the engine.

The view has one API for mutating the engine: `submit_command`. Every building placement, road, and demolition is a command.

The mutation results come back as events from the engine.

---

## Intentionally non-DRY

Besides some common helpers, every content-side scene is an isolated scene tree in its own directory.

A registry automatically discovers content from directory structure conventions.

Therefore, when I'm wearing the content designer hat, I can focus on the building, the resource, or the event I want to tweak without caring about the overall system.

---

## Brews & Kings

This engine powers **Brews & Kings**, a roguelike medieval city builder where your whole city feeds one sprawling brewing operation — and kings rise or fall on the strength of your beer. Wishlist it on Steam to follow along.

<iframe src="https://store.steampowered.com/widget/4845040/" frameborder="0" width="646" height="190"></iframe>
