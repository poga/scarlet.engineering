---
title: One Shader, One Mesh, One Island
date: 2026-04-10
description: How we built organic islands with tidal water using SDFs and noise
image: https://scarlet.engineering/blog/images/ground_sdf_viz.png
---

<video autoplay loop muted playsinline>
  <source src="/blog/images/ground_hero.mp4" type="video/mp4">
</video>

This is one shader on a flat mesh. No hand-painted terrain, no tile maps. Just math. Here's how it works.

---

## It's All SDFs

![](/blog/images/ground_sdf_viz.png)

The trick behind everything is a **signed distance field**. For every pixel on the ground, we bake a single number: how far is this point from the nearest coastline? Negative means underwater, positive means land.

That one number drives the entire shader — where the water is, where foam appears, how deep the sea gets, where biomes blend.

We bake the SDFs on the GPU at map generation time. Each water region's polygon gets rendered into a SubViewport using a shader that computes the signed distance from every pixel to that polygon's edges. Then we pack up to three regions into the R, G, B channels of a single texture, with meadow distance in the alpha channel. One texture lookup, four distance fields.

## Painting the Ground

![](/blog/images/ground_zones.png)

With the SDF in hand, blending terrain textures is just a `smoothstep` on the distance. Close to a forest region? Blend in forest texture. Inside a meadow area? Fade to meadow. The transitions are soft and organic — no hard seams, no manual painting.

The SDF does all the spatial reasoning. The shader just asks "how close am I?" and blends accordingly.

## The Water

![](/blog/images/ground_water.png)

The shoreline is where it gets fun. We layer four zones by depth: foam at the very edge, then shallow water, medium sea, and deep sea. Each has its own texture, its own color variation, and its own shimmer — subtle FBM noise that shifts over time.

But the real trick is that we don't draw the water boundary where the SDF says it is. We distort it with FBM noise first. That's what makes the coastline look organic instead of following the exact polygon edge. The water seeps into coves and pulls back from headlands, like a real shoreline.

## Breathing Tides

<video autoplay loop muted playsinline>
  <source src="/blog/images/ground_hero.mp4" type="video/mp4">
</video>

We actually bake *two* SDF textures — one for low tide, one for high tide. Each represents a different polygon shape (the high-tide polygon is larger, eating into the land). At runtime, the shader just lerps between the two based on a tide level value.

Each water region has its own tide level, so different coastlines can flood independently. And on top of the global tide, every point on the shoreline gets its own wobble phase from FBM noise. The water doesn't advance as a uniform wall — it laps and breathes unevenly, like waves on a real beach.

---

Pretty happy with how this turned out. One flat mesh, a couple of baked textures, and a lot of noise functions go a surprisingly long way.

<br />Poga
