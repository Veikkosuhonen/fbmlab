precision highp float;

uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform float u_gamma; /// default 2.2 min 0.0 max 10.0
uniform float u_exposure; /// default 1.0 min 0.0 max 10.0

void main() {
  vec2 st = gl_FragCoord.st / u_resolution;

  vec3 hdrColor = texture2D(u_texture, st).rgb;

  // exposure tone mapping
  vec3 mapped = vec3(1.0) - exp(-hdrColor * u_exposure);
  // gamma correction 
  mapped = pow(mapped, vec3(1.0 / u_gamma));

  gl_FragColor = vec4(mapped, 1.0);
}
