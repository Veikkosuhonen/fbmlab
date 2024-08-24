precision highp float;

const int NUM_OCTAVES = 5;
const int NUM_OCTAVES_FRACTAL = 3;
const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;
const float HALF_PI = 1.57079632679;

uniform vec2 u_resolution;
// uniform vec2 u_canvasSize;
uniform float u_time;
uniform float u_lacunarity; /// default 2.0 min 0.0 max 10.0
uniform float u_persistence; /// default 0.5 min 0.0 max 1.5
uniform float u_scale; /// default 3.0 min 0.1 max 10.0
uniform float u_fractalWarp; /// default 0.1 min -1.0 max 1.0
uniform float u_rot1; /// default 0.7 min 0.0 max 1.6
uniform float u_rot2; /// default 0.77 min 0.0 max 1.6

uniform float u_greenBase; /// default 0.0 min -1.0 max 1.0
uniform float u_greenRange; /// default 0.0 min 0.0 max 2.0
uniform float u_blueBase; /// default 0.0 min -1.0 max 1.0
uniform float u_blueRange; /// default 0.0 min 0.0 max 2.0
uniform float u_lightnessBase; /// default 0.5 min 0.0 max 1.0
uniform float u_lightnessRange; /// default 0.5 min 0.0 max 2.0

#include "./lygia/generative/noised.glsl"
#include "./lygia/color/space/oklab2rgb.glsl"

float fbm(in vec2 _st) {

  float v = 0.0;
  float a = u_persistence;
  vec2 shift = vec2(100.0);
  // Rotate to reduce axial bias
  mat2 rot = mat2(cos(u_rot1), sin(u_rot1),
                 -sin(u_rot1), cos(u_rot1));

  for (int i = 0; i < NUM_OCTAVES; ++i) {
    v += a * noised(_st).x;
    _st = rot * _st * u_lacunarity + shift;
    a *= u_persistence;
  }

  return v;
}

float f_fbm(in vec2 _st) {
  mat2 rot = mat2(cos(u_rot2), sin(u_rot2),
                 -sin(u_rot2), cos(u_rot2));

  for (int i = 0; i < NUM_OCTAVES_FRACTAL; i++) {
    _st = rot * _st + vec2(100.0);
    _st += fbm(_st + vec2(10.0) * float(i)) * u_fractalWarp;
  }
  return fbm(_st);
}

void main() {

  vec2 fragCoord = gl_FragCoord.st;

  vec2 st = fragCoord / u_resolution;
  st.s *= u_resolution.s / u_resolution.t;
  st *= u_scale;

  vec3 color = vec3(0.0, 0.0, 0.0);

  vec2 q = vec2(0.);
  q.x = f_fbm( st + vec2(234.0));
  q.y = f_fbm( st + vec2(321.0));

  vec2 r = vec2(0.);
  r.x = f_fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*u_time);
  r.y = f_fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*u_time);

  float f = f_fbm(st+r);

  color = oklab2rgb(vec3(
    clamp(u_lightnessBase + u_lightnessRange * f, 0.0, 1.0),
    clamp(u_greenBase + u_greenRange * r.x, -1.0, 1.0),
    clamp(u_blueBase + u_blueRange * q.y, -1.0, 1.0) 
  ));
  
  gl_FragColor = vec4(color, 1.0);
}
