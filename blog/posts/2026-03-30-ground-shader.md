---
title: "The Ground Beneath Your Feet"
date: 2026-03-30
description: How we went from obviously tiled texture to hand-drawn terrain — and what didn't work
image: https://scarlet.engineering/blog/images/ground-shader-final.png
---

The ground fills 80% of the screen in a top-down survival game. If it looks bad, everything looks bad. Here's how we went from obviously tiled texture to organic terrain — and the dead ends along the way.

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

## Attempt 4: Sharp Weights + Frequency Separation

Two ideas that sounded right but didn't solve the real problem.

**Sharp weights.** Cube the weights with `pow(weight, 3.0)` so one sample dominates in each region. The others fade out. This preserves crispness within each region — but the hand-drawn curves in our texture have a specific direction. Blending rotated copies at any ratio still crosses lines at different angles.

**Frequency separation.** Extract high-frequency detail from the unrotated sample and layer it on top of the blended base. The theory: tiling is only visible in low-frequency color, so blend the blurred versions for anti-tiling and keep the sharp detail from one clean sample.

```glsl
vec3 raw_blur = textureLod(ground_texture, uv_scaled, 3.0).rgb;
vec3 detail = s1 - raw_blur;
vec3 color = base + detail * detail_strength;
```

This didn't work either. The hand-drawn curves in our texture aren't just color differences at a certain frequency — they're spatial structures. Thin, elongated, curved lines. Frequency separation treats them as luminance variation indistinguishable from grain noise. Cranking `detail_strength` amplified noise and grain but the curves never came through.

We tried two-band separation (splitting mid-frequency cracks from high-frequency grain with an intermediate mip level), blur-domain anti-tiling (blending only the blurred samples, keeping detail from the unrotated one), and adding a brightness uniform to lift the base. None of it worked because we were solving the wrong problem.

## The Fix: Stop Processing, Start Looking

After all that shader work, we removed everything and looked at the raw texture on the mesh. No anti-tiling, no frequency separation, no color variation. Just `texture(ground_texture, uv_scaled).rgb`.

The curves weren't visible. Not because of the shader — because of the **scale**. At `texture_scale = 40`, each tile is 5 world units. The hand-drawn strokes, which are maybe 20-30 pixels wide in the source texture, rendered at sub-pixel size. No amount of shader processing can show you detail that's smaller than a pixel.

We dropped `texture_scale` from 40 to 10. Each tile is now 20 world units. The hand-drawn curves are clearly visible. The texture looks like it was meant to look — organic, hand-painted, with character.

<img src="/blog/images/ground-shader-final.png" alt="Final result - hand-drawn curves visible at texture scale 10" style="max-width: 100%;" />

Yes, tiling is more visible at scale 10 than at scale 40. But the texture was drawn to tile seamlessly, and at this scale the repetition reads as natural ground variation rather than an obvious grid. The hand-drawn character of the texture does more for the "organic" feel than any amount of procedural blending ever did.

The anti-tiling rotation blend still works great for the water layers, where there's no directional detail to preserve. Different textures need different approaches.

Here's the complete ground shader:

```glsl
shader_type spatial;

uniform sampler2D ground_texture : source_color, filter_linear_mipmap, repeat_enable;
uniform float texture_scale : hint_range(1.0, 100.0) = 10.0;
uniform float color_variation : hint_range(0.0, 0.2) = 0.05;
uniform float detail_strength : hint_range(0.0, 2.0) = 0.8;
uniform sampler2D water_texture : source_color, filter_linear_mipmap, repeat_enable;
uniform sampler2D medium_sea_texture : source_color, filter_linear_mipmap, repeat_enable;
uniform sampler2D deepsea_texture : source_color, filter_linear_mipmap, repeat_enable;
uniform float medium_sea_inset : hint_range(0.0, 30.0) = 6.0;
uniform float deepsea_inset : hint_range(0.0, 30.0) = 12.0;
uniform float foam_width : hint_range(0.0, 5.0) = 1.0;
uniform float shore_transition_width : hint_range(0.0, 2.0) = 0.3;
uniform float foam_brightness : hint_range(0.0, 1.0) = 0.4;
uniform float blend_width : hint_range(1.0, 10.0) = 4.0;
uniform float ground_plane_size = 200.0;
uniform float tide_offset = 0.0;
uniform float tide_wobble_amplitude = 0.15;
uniform float tide_wobble_frequency = 1.5;
const int MAX_WATER_POINTS = 32;
uniform vec2 water_region_points[MAX_WATER_POINTS];
uniform int water_region_count = 0;

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

float sd_polygon(vec2 p) {
	if (water_region_count < 3) {
		return 1000.0;
	}
	float d = 1e10;
	float s = 1.0;
	int j = water_region_count - 1;
	for (int i = 0; i < MAX_WATER_POINTS; i++) {
		if (i >= water_region_count) {
			break;
		}
		vec2 vi = water_region_points[i];
		vec2 vj = water_region_points[j];
		vec2 e = vj - vi;
		vec2 w = p - vi;
		vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
		d = min(d, dot(b, b));
		bvec3 cond = bvec3(p.y >= vi.y, p.y < vj.y, e.x * w.y > e.y * w.x);
		if (all(cond) || all(not(cond))) {
			s *= -1.0;
		}
		j = i;
	}
	return s * sqrt(d);
}

void fragment() {
	vec2 uv_scaled = UV * texture_scale;

	// Ground: raw texture, no processing — preserves hand-drawn curves
	vec3 color = texture(ground_texture, uv_scaled).rgb;

	// FBM weights for water layer anti-tiling
	float w1 = pow(fbm(UV * 8.0), 3.0);
	float w2 = pow(fbm(UV * 8.0 + vec2(5.2, 1.3)), 3.0);
	float w3 = pow(fbm(UV * 8.0 + vec2(1.7, 9.1)), 3.0);
	float total = w1 + w2 + w3 + 0.001;
	w1 /= total; w2 /= total; w3 /= total;

	vec3 final_color = color;
	if (water_region_count >= 3) {
		vec2 world_pos = (UV - 0.5) * ground_plane_size;
		float raw_dist = sd_polygon(world_pos);
		float effective_dist = raw_dist - tide_offset
			- sin(TIME * tide_wobble_frequency) * tide_wobble_amplitude;

		// --- Water layers use rotation blend + frequency separation ---
		// (water textures have no directional detail to preserve)

		// Shallow water
		vec3 ws1 = texture(water_texture, uv_scaled).rgb;
		vec3 ws2 = texture(water_texture, rotate_uv(UV, 1.0472) * texture_scale * 0.93).rgb;
		vec3 ws3 = texture(water_texture, rotate_uv(UV, 2.0944) * texture_scale * 1.07).rgb;
		vec3 water_base = ws1 * w1 + ws2 * w2 + ws3 * w3;
		vec3 water_blur = textureLod(water_texture, uv_scaled, 3.0).rgb;
		vec3 water_color = water_base + (ws1 - water_blur) * detail_strength;
		water_color += vec3(-1, 0.4, 1) * ((fbm(UV * 3.0 + vec2(7.3, 2.1)) - 0.5) * color_variation);
		water_color += vec3((fbm(world_pos * 0.8 + TIME * 0.4) - 0.5) * 0.08);

		// Medium sea
		vec3 ms1 = texture(medium_sea_texture, uv_scaled).rgb;
		vec3 ms2 = texture(medium_sea_texture, rotate_uv(UV, 1.0472) * texture_scale * 0.93).rgb;
		vec3 ms3 = texture(medium_sea_texture, rotate_uv(UV, 2.0944) * texture_scale * 1.07).rgb;
		vec3 medium_sea_base = ms1 * w1 + ms2 * w2 + ms3 * w3;
		vec3 medium_sea_blur = textureLod(medium_sea_texture, uv_scaled, 3.0).rgb;
		vec3 medium_sea_color = medium_sea_base + (ms1 - medium_sea_blur) * detail_strength;
		medium_sea_color += vec3(-0.5, 0.3, 1.1) * ((fbm(UV * 3.0 + vec2(9.2, 5.4)) - 0.5) * color_variation);
		medium_sea_color += vec3((fbm(world_pos * 0.6 + TIME * 0.3 + vec2(11.4, 3.8)) - 0.5) * 0.05);

		// Deep sea
		vec3 ds1 = texture(deepsea_texture, uv_scaled).rgb;
		vec3 ds2 = texture(deepsea_texture, rotate_uv(UV, 1.0472) * texture_scale * 0.93).rgb;
		vec3 ds3 = texture(deepsea_texture, rotate_uv(UV, 2.0944) * texture_scale * 1.07).rgb;
		vec3 deepsea_base = ds1 * w1 + ds2 * w2 + ds3 * w3;
		vec3 deepsea_blur = textureLod(deepsea_texture, uv_scaled, 3.0).rgb;
		vec3 deepsea_color = deepsea_base + (ds1 - deepsea_blur) * detail_strength;
		deepsea_color += vec3(-0.4, 0.2, 1.2) * ((fbm(UV * 3.0 + vec2(3.1, 8.7)) - 0.5) * color_variation);
		deepsea_color += vec3((fbm(world_pos * 0.4 + TIME * 0.2 + vec2(4.6, 14.2)) - 0.5) * 0.025);

		// Shoreline compositing
		float distorted = effective_dist + fbm(world_pos * 0.5) * blend_width * 0.5;
		float depth = -distorted;
		float foam_factor = smoothstep(0.0, shore_transition_width, depth);
		float water_factor = smoothstep(foam_width, foam_width + shore_transition_width, depth);
		vec3 foam_color = mix(water_color, vec3(1.0), foam_brightness);

		float medium_distorted = effective_dist
			+ fbm(world_pos * 0.5 + vec2(11.4, 3.8)) * blend_width * 0.5;
		float medium_blend = smoothstep(
			-medium_sea_inset - blend_width * 0.5, -medium_sea_inset, medium_distorted);

		float deep_distorted = effective_dist
			+ fbm(world_pos * 0.5 + vec2(4.6, 14.2)) * blend_width * 0.5;
		float deep_blend = smoothstep(
			-deepsea_inset - blend_width * 0.5, -deepsea_inset, deep_distorted);

		vec3 water_final = mix(deepsea_color, medium_sea_color, deep_blend);
		water_final = mix(water_final, water_color, medium_blend);

		vec3 shore_composite = mix(foam_color, water_final, water_factor);
		final_color = mix(color, shore_composite, foam_factor);
	}

	ALBEDO = final_color;
}
```
