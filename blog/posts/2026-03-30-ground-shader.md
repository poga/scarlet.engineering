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

<img src="/blog/images/ground-shader-base-texture.png" alt="Base 512x512 ground texture" style="max-width: 256px;" />

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

Here's the complete shader. About 60 lines, zero additional texture assets.

```glsl
shader_type spatial;

uniform sampler2D ground_texture : source_color, filter_linear_mipmap, repeat_enable;
uniform float texture_scale : hint_range(1.0, 100.0) = 40.0;
uniform float color_variation : hint_range(0.0, 0.2) = 0.05;
uniform float detail_strength : hint_range(0.0, 2.0) = 0.8;

float hash(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * 0.1031);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);

	float a = hash(i);
	float b = hash(i + vec2(1.0, 0.0));
	float c = hash(i + vec2(0.0, 1.0));
	float d = hash(i + vec2(1.0, 1.0));

	return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

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

vec2 rotate_uv(vec2 uv, float angle) {
	float s = sin(angle);
	float c = cos(angle);
	return vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
}

void fragment() {
	vec2 uv_scaled = UV * texture_scale;

	vec3 s1 = texture(ground_texture, uv_scaled).rgb;
	vec3 s2 = texture(ground_texture, rotate_uv(UV, 1.0472) * texture_scale * 0.93).rgb;
	vec3 s3 = texture(ground_texture, rotate_uv(UV, 2.0944) * texture_scale * 1.07).rgb;

	float w1 = pow(fbm(UV * 8.0), 3.0);
	float w2 = pow(fbm(UV * 8.0 + vec2(5.2, 1.3)), 3.0);
	float w3 = pow(fbm(UV * 8.0 + vec2(1.7, 9.1)), 3.0);
	float total = w1 + w2 + w3 + 0.001;
	w1 /= total; w2 /= total; w3 /= total;

	vec3 base = s1 * w1 + s2 * w2 + s3 * w3;

	vec3 raw_blur = textureLod(ground_texture, uv_scaled, 3.0).rgb;
	vec3 detail = s1 - raw_blur;

	vec3 color = base + detail * detail_strength;

	float variation = (fbm(UV * 3.0) - 0.5) * color_variation;
	color += vec3(variation, variation * 0.5, -variation);

	ALBEDO = color;
}
```

## Update: Preserving Hand-Drawn Detail

The shader above solved tiling but had a problem: the hand-drawn strokes in the original texture were gone. Blending three rotated copies of a texture with directional line work averages the lines out — lines at different angles cancel each other.

The fix is **frequency separation**. Use the blended samples only for low-frequency base color (tiling-free), then extract the hand-drawn strokes from a single unrotated sample and layer them back on top.

```glsl
// Blended base — smooth, tiling-free, but no line detail
vec3 base = s1 * w1 + s2 * w2 + s3 * w3;

// High-pass: textureLod at mip 3 gives a blurred version of the same area.
// Subtracting it isolates fine strokes.
vec3 raw_blur = textureLod(ground_texture, uv_scaled, 3.0).rgb;
vec3 detail = s1 - raw_blur;

// Combine: organic base + crisp hand-drawn lines
vec3 color = base + detail * detail_strength;
```

The key insight: `textureLod(sampler, uv, 3.0)` reads the texture at mip level 3 — effectively an 8x downsampled blur. Subtracting it from the sharp sample leaves only high-frequency information: the pen strokes, grain, and scratches. Since these are added on top of the already tiling-free base, the lines are visible but don't reintroduce the tiling grid.

`detail_strength` (exported to the Inspector) controls how much the strokes come through. At 0 you get the smooth blended result; at 0.8 (default) the hand-drawn character is clearly visible.

<img src="/blog/images/ground-shader-detail-preserved.png" alt="After frequency separation - hand-drawn strokes preserved" style="max-width: 100%;" />
