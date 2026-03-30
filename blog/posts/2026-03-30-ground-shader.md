---
title: "The Ground Beneath Your Feet"
date: 2026-03-30
description: How we went from obviously tiled texture to organic terrain with a 60-line shader
image: https://scarlet.engineering/blog/images/ground-shader-final.png
---

The ground fills 80% of the screen in a top-down survival game. If it looks bad, everything looks bad. Here's how we went from obviously tiled texture to organic terrain in our Don't Starve-inspired prototype.

<img src="/blog/images/ground-shader-reference.png" alt="Don't Starve reference" style="max-width: 100%;" />

## The Naive Approach

Take a 512x512 dirt texture, put it on a 200x200 unit mesh, tile it 40x.

<img src="/blog/images/ground-shader-naive.png" alt="First attempt - visible grid" style="max-width: 100%;" />

The grid is immediately visible. Every 5 units, the exact same pattern repeats. Your brain picks up on it and can't unsee it.

## Attempt 1: Blend Two Rotated Samples

Sample the texture twice at different rotations and blend them. Rotate the second sample 45 degrees with a different scale, blend with a noise function.

```glsl
vec3 sample1 = texture(ground_texture, UV * 40.0).rgb;
vec3 sample2 = texture(ground_texture, rotate_uv(UV, 0.785) * 27.0).rgb;
float blend = noise(UV * 8.0);
vec3 color = mix(sample1, sample2, blend * 0.5);
```

The base sample still dominates. The original grid bleeds through, now with a second, subtler grid on top. Two grids are not better than one.

## Attempt 2: UV Distortion

Warp the UV coordinates with noise before sampling. Straight tile boundaries become wavy.

```glsl
vec2 warp = vec2(noise(UV * 12.0), noise(UV * 12.0 + vec2(5.2, 1.3)));
vec2 warped_uv = UV + (warp - 0.5) * 0.03;
```

<img src="/blog/images/ground-shader-uv-distortion.png" alt="After UV distortion - wavy grid" style="max-width: 100%;" />

A wavy grid is still a grid. The human eye detects repeating patterns even when they're distorted. This treats the symptom (straight lines) instead of the cause (visible repetition).

## Attempt 3: Three-Way Rotation Blend

Use **three** samples at 0, 60, and 120 degrees. No single grid axis dominates. Slightly different scales (0.93x and 1.07x) prevent alignment.

```glsl
vec3 s1 = texture(ground_texture, UV * scale).rgb;                          // 0 deg
vec3 s2 = texture(ground_texture, rotate_uv(UV, 1.047) * scale * 0.93).rgb; // 60 deg
vec3 s3 = texture(ground_texture, rotate_uv(UV, 2.094) * scale * 1.07).rgb; // 120 deg
```

Single-octave noise for the blend weights creates visible patches at one frequency. FBM (fractional Brownian motion) layers 4 octaves of noise for variation at every scale:

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

The grid was gone. But so was all the detail. Smooth blending of three samples averages everything into mush.

## The Final Piece: Sharp Weights + Detail Overlay

Two fixes.

**Sharp weights.** Cube the weights with `pow(weight, 3.0)`. One sample dominates in each region while the others fade out. Full crispness of a single texture sample, but which sample dominates changes organically across the terrain.

```glsl
float w1 = pow(fbm(UV * 6.0), 3.0);
float w2 = pow(fbm(UV * 6.0 + vec2(5.2, 1.3)), 3.0);
float w3 = pow(fbm(UV * 6.0 + vec2(1.7, 9.1)), 3.0);
// normalize...
```

**Detail overlay.** Sample the texture one more time at 2.1x scale with a slight rotation. Blend it at 30% as a luminance modulation. This restores fine-grained surface detail in the transition zones.

```glsl
vec3 detail = texture(ground_texture, rotate_uv(UV, 0.5) * scale * 2.1).rgb;
color = mix(color, color * (detail / avg_brightness), 0.3);
```

<img src="/blog/images/ground-shader-final.png" alt="Final result - organic terrain" style="max-width: 100%;" />

## Lessons Learned

1. **Warping a grid still looks like a grid.** UV distortion treats the symptom (straight lines), not the cause (visible repetition). Attack the repetition itself.

2. **Two rotations aren't enough.** With two samples, one grid axis always dominates. Three samples at 60-degree intervals is the minimum where no direction wins.

3. **Smooth blending destroys detail.** Naive `mix(a, b, weight)` averages textures into blur. Sharpening blend weights with a power function preserves the crispness of individual samples while keeping organic transitions.

4. **Multi-octave noise is non-negotiable.** Single-frequency noise creates its own visible pattern. FBM gives variation at every scale, from broad landscape-level patches down to fine local detail.

The entire shader is about 60 lines and uses zero additional texture assets. Everything comes from re-sampling one 512x512 image at different scales and rotations. Sometimes the best solution is smarter math, not more art.

<br />Poga
