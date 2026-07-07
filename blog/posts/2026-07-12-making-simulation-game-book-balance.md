---
title: "Making a Simulation Game - Part 3: The Books must Balance"
date: 2026-07-12
description: There's a Double-entry Bookkeeping system in my game?
image: https://scarlet.engineering/blog/images/PLACEHOLDER.png
draft: true
---

In an early build of Brews & Kings, demolishing a house while its worker was out on a delivery deleted the worker. The game didn't crash. It kept running with one less worker, and nothing reported the loss.

Resource bugs in a builder sim are hard to find because nothing crashes. A playtester tells you the brewery feels slow. There is no stack trace for that.

Every resource mutations, such as:

- Spawning and draining resources.
- building buffers and agents in flight.
- and every transmute, arrival, refund, and demolition.

...is a chance for the books to drift.

---

## Engine is a Long Term Investment

In [part 2](/blog/making-simulation-game-part-2-architecture/) we splited the system into views, contents, and engine. Since only engine can mutate resources, we can focus our effort on the engine side and build lots of tooling for it.

That's another benefit of the split: **the engine rarely changes**. and every investment towards it pays off long term.

---

## Double-entry bookkeeping in one minute

Accountants solved this in the 1400s.

The rule: **value is never created or destroyed. It only moves between accounts.** So every transaction is written down twice: once in the account the value leaves, once in the account it enters. The two entries cancel out.

Say a bookstore buys $100 of books from a supplier. One transaction, two entries:

```mermaid
flowchart LR
    subgraph ledger ["The bookstore's ledger"]
        direction LR
        Cash["<b>Cash</b><br/>$500 − $100 = $400"]
        Books["<b>Book inventory</b><br/>$300 + $100 = $400"]
    end
    Cash -- "one transaction<br/>credit −$100 · debit +$100" --> Books
```

Before: `$500` + `$300` = `$800`. After: `$400` + `$400` = `$800`. The total never changes. Money just moved.

In my engine, the accounts are:

- every building's buffer,
- every agent in flight (a courier carrying grain is an account: value in transit),
- and two derived columns per building, `reserved` and `pending`, for deliveries that haven't landed yet.

At any tick, `reserved` and `pending` must match the agents in flight exactly, and the totals must balance. That's the invariant my engine checks every tick.

---

## The fuzzer

In [part 2](/blog/making-simulation-game-part-2-architecture/) I said the engine doesn't know what beer is. A side effect: the engine runs headless. No renderer, no view layer, just ticks.

So I built a fuzzer with three parts:

1. **A skeleton village.** Scripted setups from the real production chains: forest → woodcutter camp, grain field → farm, well → brewery → town.
2. **A chaos player.** A random command generator. Every ~50 ticks it places a random building, demolishes one, pauses one, or resumes one.
3. **An auditor.** Two levels of checks:
    - Every tick: no account goes negative, every `reserved`/`pending` entry traces back to a real agent in flight, no references to demolished buildings.
    - End of run: a conservation ledger per resource: Δ(stock + in-flight) = produced - consumed - delivered - construction - lost. If it's off by one unit, the run fails and dumps the command log.

```mermaid
flowchart LR
    S["skeleton village<br/>(real production chains)"] --> T["tick loop"]
    C["chaos player<br/>place · demolish · pause · resume"] --> T
    T --> L1["every tick:<br/>promises match agents in flight"]
    T --> L2["end of run:<br/>conservation ledger closes"]
```

Two design details:

- The chaos player only makes legal moves. It checks the state before emitting a command. I'm fuzzing the bookkeeping, not the input validation.
- It has its own seeded RNG, separate from the sim's. The engine is deterministic (part 1), so every failure replays exactly.

### What it caught

- Pause and resume commands were no-ops. They fired a signal and mutated nothing. I found this while writing the fuzzer spec, before it even ran.
- Demolishing a building left dangling references on couriers that were mid-route.
- The vanishing worker from the intro. The refund path for a worker without a home dropped the worker. The ledger expected 0 and got -1.
- The wood ledger expected -1 and closed at -3. Two units of wood were lost in a town-order path that no hand-written test covered.

All of these passed the unit tests, because unit tests only cover scenarios I could think of.

### The auditor had bugs too

The first ledger imbalances were bugs in the auditor itself:

- Grain fields regrow by writing into their own buffer directly, without a production event. The meter never saw the grain appear and reported a dupe.
- Workers riding along on return deliveries weren't counted as in flight, so they showed up as leaks.

The lesson: double-entry bookkeeping only works if every mutation goes through a path the books can see.

This led to one engine change: a `resource_lost` event. Some losses are intentional (demolishing a house with workers inside destroys the workers). That's fine, but the engine has to record it. Every lossy path now emits the event, and the ledger has a `lost` column.

---

A builder sim is an economy. Double-entry bookkeeping turns vague reports like "the brewery feels slow" into a failing assert with a tick number, a resource name, and a seed that replays the run.

---

## Brews & Kings

This engine powers **Brews & Kings**, a roguelike medieval city builder where your whole city feeds one sprawling brewing operation, and kings rise or fall on the strength of your beer. Wishlist it on Steam to follow along.

<iframe src="https://store.steampowered.com/widget/4845040/" frameborder="0" width="646" height="190"></iframe>
