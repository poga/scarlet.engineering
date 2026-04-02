---
title: "The Ground Beneath Your Feet"
date: 2026-03-30
description: Blending four hand-drawn textures into a seamless island with signed distance fields and FBM noise
image: https://scarlet.engineering/blog/images/ground-shader-final.png
---

The ground fills 80% of the screen in a top-down survival game. If it looks bad, everything looks bad. Our island needs sand, shallow water, open sea, and deep ocean — four hand-drawn textures that blend into each other with organic, wobbly shorelines. One shader, one mesh, no seams.

<img src="/blog/images/ground-shader-final.png" alt="Final result - four blended terrain layers" style="max-width: 100%;" />

## The Setup

A 200x200 unit plane with four tiling textures painted to match our art style. The shader's job: decide which texture to show at each pixel, and blend between them at the boundaries.

<img src="/blog/images/ground-shader-base-texture.png" alt="Base 512x512 ground texture" style="max-width: 256px;" />

The water region is defined by a polygon — a `CollisionPolygon3D` placed in the editor. The designer draws the coastline shape and the shader does the rest.

## Step 1: Signed Distance to the Shoreline

To know which texture to use at each pixel, we need to know how far that pixel is from the water boundary. A signed distance field gives us exactly that: negative inside the water, positive on land, with the magnitude telling us how far.

```glsl
float sd_polygon(vec2 p) {
    float d = 1e10;
    float s = 1.0;
    for (int i = 0; i < point_count; i++) {
        vec2 vi = points[i];
        vec2 vj = points[prev];
        vec2 e = vj - vi;
        vec2 w = p - vi;
        vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
        d = min(d, dot(b, b));
        // winding number for inside/outside
        bvec3 cond = bvec3(p.y >= vi.y, p.y < vj.y, e.x * w.y > e.y * w.x);
        if (all(cond) || all(not(cond))) s *= -1.0;
        prev = i;
    }
    return s * sqrt(d);
}
```

This runs per-pixel in the fragment shader. The polygon points are passed in as a uniform array from GDScript. The SDF gives us a smooth distance gradient we can use for all the blending decisions.

## Step 2: Organic Shorelines with FBM Distortion

A straight shoreline following the polygon edge looks mechanical. We distort the distance value with FBM noise to get organic, wobbly boundaries:

```glsl
float distorted = effective_dist + fbm(world_pos * 0.5) * blend_width * 0.5;
```

FBM (fractional Brownian motion) layers multiple octaves of noise at different scales. The result is variation at every frequency — large bays and small inlets in the same shoreline.

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

Each water depth layer uses a **different FBM seed** so the boundaries don't move in lockstep:

```glsl
float shore_distorted = effective_dist + fbm(world_pos * 0.5) * blend_width * 0.5;
float medium_distorted = effective_dist + fbm(world_pos * 0.5 + vec2(11.4, 3.8)) * blend_width * 0.5;
float deep_distorted = effective_dist + fbm(world_pos * 0.5 + vec2(4.6, 14.2)) * blend_width * 0.5;
```

The offset vectors (`vec2(11.4, 3.8)`, etc.) shift each layer's noise pattern so the shallow-to-medium boundary wobbles independently from the medium-to-deep boundary.

## Step 3: Zone Compositing

With the distorted distances, we composite four layers in order: sand → foam → shallow → medium → deep.

The shoreline itself has two tight zones. A foam strip brightens the shallow water right at the waterline, then transitions to the full water texture:

```glsl
float depth = -distorted; // positive = deeper into water
float foam_factor = smoothstep(0.0, shore_transition_width, depth);
float water_factor = smoothstep(foam_width, foam_width + shore_transition_width, depth);

vec3 foam_color = mix(water_color, vec3(1.0), foam_brightness);
vec3 shore_composite = mix(foam_color, water_final, water_factor);
final_color = mix(ground_color, shore_composite, foam_factor);
```

The deeper layers cascade inward using `smoothstep` on the inset distance:

```glsl
float medium_blend = smoothstep(-medium_sea_inset - blend_width * 0.5,
                                -medium_sea_inset, medium_distorted);
float deep_blend = smoothstep(-deepsea_inset - blend_width * 0.5,
                              -deepsea_inset, deep_distorted);

vec3 water_final = mix(deepsea_color, medium_sea_color, deep_blend);
water_final = mix(water_final, water_color, medium_blend);
```

Note the cascade order: start from the deepest layer and blend outward. Deep → medium → shallow. Each `mix` overwrites the previous layer where it's closer to shore.

## Step 4: Shimmer

Static water looks dead. Each layer gets FBM-based luminance variation animated over time, with decreasing intensity for deeper water:

```glsl
// Shallow: strongest shimmer
water_color += vec3((fbm(world_pos * 0.8 + TIME * 0.4) - 0.5) * 0.08);

// Medium: moderate
medium_sea_color += vec3((fbm(world_pos * 0.6 + TIME * 0.3 + vec2(11.4, 3.8)) - 0.5) * 0.05);

// Deep: calmest
deepsea_color += vec3((fbm(world_pos * 0.4 + TIME * 0.2 + vec2(4.6, 14.2)) - 0.5) * 0.025);
```

Shallow water shimmers fast and bright (scale 0.8, speed 0.4, amplitude 0.08). Deep water barely moves (scale 0.4, speed 0.2, amplitude 0.025). The decreasing energy sells the depth.

We use FBM noise offset by `TIME` rather than UV scrolling. UV scroll creates a visible flow direction — the water looks like it's going somewhere. FBM shimmer sparkles in place, which reads as light playing on the surface.

## The Complete Shader

Four textures, one SDF polygon, FBM distortion, cascading depth layers. All designer-adjustable in the Inspector: `foam_width`, `shore_transition_width`, `blend_width`, inset distances, shimmer is baked in.

```glsl
shader_type spatial;

uniform sampler2D ground_texture : source_color, filter_linear_mipmap, repeat_enable;
uniform float texture_scale : hint_range(1.0, 100.0) = 10.0;
uniform float color_variation : hint_range(0.0, 0.2) = 0.05;
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

float sd_polygon(vec2 p) {
	if (water_region_count < 3) return 1000.0;
	float d = 1e10;
	float s = 1.0;
	int j = water_region_count - 1;
	for (int i = 0; i < MAX_WATER_POINTS; i++) {
		if (i >= water_region_count) break;
		vec2 vi = water_region_points[i];
		vec2 vj = water_region_points[j];
		vec2 e = vj - vi;
		vec2 w = p - vi;
		vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
		d = min(d, dot(b, b));
		bvec3 cond = bvec3(p.y >= vi.y, p.y < vj.y, e.x * w.y > e.y * w.x);
		if (all(cond) || all(not(cond))) s *= -1.0;
		j = i;
	}
	return s * sqrt(d);
}

void fragment() {
	vec2 uv_scaled = UV * texture_scale;
	vec3 color = texture(ground_texture, uv_scaled).rgb;

	vec3 final_color = color;
	if (water_region_count >= 3) {
		vec2 world_pos = (UV - 0.5) * ground_plane_size;
		float raw_dist = sd_polygon(world_pos);
		float effective_dist = raw_dist - tide_offset
			- sin(TIME * tide_wobble_frequency) * tide_wobble_amplitude;

		// Shallow water
		vec3 water_color = texture(water_texture, uv_scaled).rgb;
		float water_variation = (fbm(UV * 3.0 + vec2(7.3, 2.1)) - 0.5) * color_variation;
		water_color += vec3(-water_variation * 0.3, water_variation * 0.2, water_variation * 0.5);
		water_color += vec3((fbm(world_pos * 0.8 + TIME * 0.4) - 0.5) * 0.08);

		// Medium sea
		vec3 medium_sea_color = texture(medium_sea_texture, uv_scaled).rgb;
		float msv = (fbm(UV * 3.0 + vec2(9.2, 5.4)) - 0.5) * color_variation;
		medium_sea_color += vec3(-msv * 0.25, msv * 0.15, msv * 0.55);
		medium_sea_color += vec3((fbm(world_pos * 0.6 + TIME * 0.3 + vec2(11.4, 3.8)) - 0.5) * 0.05);

		// Deep sea
		vec3 deepsea_color = texture(deepsea_texture, uv_scaled).rgb;
		float dsv = (fbm(UV * 3.0 + vec2(3.1, 8.7)) - 0.5) * color_variation;
		deepsea_color += vec3(-dsv * 0.2, dsv * 0.1, dsv * 0.6);
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
