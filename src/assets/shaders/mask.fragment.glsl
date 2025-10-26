uniform vec2 uMouse;
uniform vec2 uRes;
uniform float uTime;
uniform sampler2D uTex;
uniform vec3 uHitWorldPos;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vWorldPos;

void main() {
  float d = length(vWorldPos - uHitWorldPos);

  vec4 base = texture2D(uTex, vUv);
  // float spot = 1.0 - smoothstep(0.5, 1.5, d);
  float spot = 1.0 - step(0.5, d);

  gl_FragColor = vec4(base.xyz, spot);
}