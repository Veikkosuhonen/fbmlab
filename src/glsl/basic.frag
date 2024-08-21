precision highp float;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;
const float HALF_PI = 1.57079632679;

uniform vec2 u_resolution;
// uniform vec2 u_canvasSize;
uniform float u_time;

void main() {

  vec2 fragCoord = gl_FragCoord.st;

  vec2 st = fragCoord / u_resolution;
  st.s *= u_resolution.s / u_resolution.t;

  vec3 color = vec3(0.5, st.x, st.y);
  color *= step(fract(st.x * 10.0), 0.95);
  color *= step(fract(st.y * 10.0), 0.95);

  gl_FragColor = vec4(color, 1.0);
}
