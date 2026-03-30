---
title: "The Ground Beneath Your Feet"
date: 2026-03-30
description: How we went from obviously tiled texture to organic terrain with a 60-line shader
image: https://scarlet.engineering/blog/images/ground-shader-final.png
---

One of the first things you see in a top-down survival game is the ground. It fills 80% of the screen at any given moment. If it looks bad, everything looks bad. Today we'll walk through how we went from "obviously tiled texture" to "organic terrain" in our Don't Starve-inspired prototype.

<img src="/blog/images/ground-shader-reference.png" alt="Don't Starve reference" style="max-width: 100%;" />

## The Naive Approach

The simplest way to texture a large ground plane: take a 512x512 dirt texture, slap it on a 200x200 unit mesh, and crank the UV tiling to 40x. Done, right?

<img src="/blog/images/ground-shader-naive.png" alt="First attempt - visible grid" style="max-width: 100%;" />

The grid is immediately visible. Every 5 units, the exact same pattern repeats. Your brain picks up on it instantly and can't unsee it. The ground doesn't look like terrain — it looks like wallpaper.

## Attempt 1: Blend Two Rotated Samples

The classic first instinct: sample the texture twice at different rotations and blend them. We rotate the second sample 45 degrees and use a different scale, then blend with a noise function.

```glsl
vec3 sample1 = texture(ground_texture, UV * 40.0).rgb;
vec3 sample2 = texture(ground_texture, rotate_uv(UV, 0.785) * 27.0).rgb;
float blend = noise(UV * 8.0);
vec3 color = mix(sample1, sample2, blend * 0.5);
```

This helps, but the base sample still dominates. You can see the original grid bleeding through, now with a second, subtler grid on top. Two grids are not better than one.

## Attempt 2: UV Distortion

What if we warp the UV coordinates with noise before sampling? Instead of straight tile boundaries, they become wavy.

```glsl
vec2 warp = vec2(noise(UV * 12.0), noise(UV * 12.0 + vec2(5.2, 1.3)));
vec2 warped_uv = UV + (warp - 0.5) * 0.03;
```

<img src="/blog/images/ground-shader-uv-distortion.png" alt="After UV distortion - wavy grid" style="max-width: 100%;" />

Better... but a wavy grid is still a grid. The human eye is remarkably good at detecting repeating patterns, even when they're distorted. We're treating the symptom (straight lines) instead of the disease (visible repetition).

## Attempt 3: Three-Way Rotation Blend

The breakthrough: instead of two samples, use **three** at 0, 60, and 120 degrees. With three rotations at 60-degree intervals, no single grid axis dominates. We also use slightly different scales (0.93x and 1.07x) for the rotated samples so they never align.

```glsl
vec3 s1 = texture(ground_texture, UV * scale).rgb;                          // 0 deg
vec3 s2 = texture(ground_texture, rotate_uv(UV, 1.047) * scale * 0.93).rgb; // 60 deg
vec3 s3 = texture(ground_texture, rotate_uv(UV, 2.094) * scale * 1.07).rgb; // 120 deg
```

For the blend weights, single-octave noise wasn't cutting it — it creates visible patches at one frequency. We switched to FBM (fractional Brownian motion), which layers 4 octaves of noise for variation at every scale:

```glsl
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
```

The grid was gone. But so was all the detail. Blending three samples smoothly averages everything into mush.

## The Final Piece: Sharp Weights + Detail Overlay

The fix is two-fold.

**Sharp weights.** Instead of smooth blending where all three samples contribute roughly equally, we cube the weights with `pow(weight, 3.0)`. This makes one sample dominate in each region while the others fade out. You get the full crispness of a single texture sample, but *which* sample dominates changes organically across the terrain.

```glsl
float w1 = pow(fbm(UV * 6.0), 3.0);
float w2 = pow(fbm(UV * 6.0 + vec2(5.2, 1.3)), 3.0);
float w3 = pow(fbm(UV * 6.0 + vec2(1.7, 9.1)), 3.0);
// normalize...
```

**Detail overlay.** We sample the texture one more time at 2.1x scale with a slight rotation and blend it at 30% as a luminance modulation. This restores fine-grained surface detail that survives even in the transition zones.

```glsl
vec3 detail = texture(ground_texture, rotate_uv(UV, 0.5) * scale * 2.1).rgb;
color = mix(color, color * (detail / avg_brightness), 0.3);
```

The result: terrain that looks continuous, organic, and detailed — from a single 512x512 texture.

<img src="/blog/images/ground-shader-final.png" alt="Final result - organic terrain" style="max-width: 100%;" />

## Lessons Learned

1. **Warping a grid still looks like a grid.** UV distortion treats the symptom (straight lines), not the disease (visible repetition). You need to attack the repetition itself.

2. **Two rotations aren't enough.** With two samples, one grid axis always dominates. Three samples at 60-degree intervals is the minimum where no direction wins.

3. **Smooth blending destroys detail.** The naive `mix(a, b, weight)` averages textures into blur. Sharpening the blend weights with a power function preserves the crispness of individual samples while keeping organic transitions.

4. **Multi-octave noise is non-negotiable.** Single-frequency noise creates its own visible pattern. FBM gives you variation at every scale, from broad landscape-level patches down to fine local detail.

The entire shader is about 60 lines and uses zero additional texture assets. Everything comes from re-sampling that one 512x512 image at different scales and rotations. Sometimes the best solution isn't more art — it's smarter math.

<br />Poga
