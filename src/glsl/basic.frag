precision highp float;

const int NUM_OCTAVES = 8;
const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;
const float HALF_PI = 1.57079632679;

uniform vec2 u_resolution;
// uniform vec2 u_canvasSize;
uniform float u_time;
uniform float u_lacunarity; /// default 2.0 min 0.0 max 10.0
uniform float u_persistence; /// default 0.5 min 0.0 max 1.5
uniform float u_scale; /// default 3.0 min 0.1 max 10.0
uniform float u_rot1; /// default 0.7 min 0.0 max 1.6

uniform vec3 u_col1; /// default 1.0 1.0 1.0
uniform vec3 u_col2; /// default 1.0 1.0 1.0
uniform vec3 u_col3; /// default 1.0 1.0 1.0

uniform float u_smoothness; /// default 0.5 min 0.08 max 1.0
uniform float u_voronoi; /// default 1.0 min -2.0 max 2.0

uniform float u_fScale; /// default 4.0 min 0.1 max 16.0

#define PLATFORM_WEBGL

#include "./lygia/generative/noised.glsl"
#include "./lygia/generative/voronoise.glsl"

float fbm(in vec2 _st) {

  float v = 0.0;
  float a = u_persistence;
  vec2 shift = vec2(0.01);
  // Rotate to reduce axial bias
  mat2 rot = mat2(cos(u_rot1), sin(u_rot1),
                 -sin(u_rot1), cos(u_rot1));

  for (int i = 0; i < NUM_OCTAVES; ++i) {
    v += a * voronoise(_st, u_voronoi, u_smoothness);
    _st = rot * _st * u_lacunarity + shift;
    a *= u_persistence;
  }

  return v;
}

void main() {

  vec2 fragCoord = gl_FragCoord.st;

  vec2 st = fragCoord / u_resolution;
  st.s *= u_resolution.s / u_resolution.t;
  st *= u_scale;

  vec3 color = vec3(0.0, 0.0, 0.0);

  vec2 q;
  q.x = fbm(st);
  q.y = fbm(st);

  vec2 r;
  r.x = fbm(st + u_fScale * q + u_time);
  r.y = fbm(st + u_fScale * q + u_time);

  float f = fbm(st + u_fScale * r);

  color = mix(color, u_col1, clamp(0.0, 1.0, f));
  color = mix(color, u_col2, clamp(0.0, 1.0, length(q)));
  color = mix(color, u_col3, clamp(0.0, 1.0, dot(r, q)));
  
  gl_FragColor = vec4(color, 1.0);
}
