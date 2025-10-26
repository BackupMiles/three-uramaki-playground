uniform vec2 uMouse;
uniform vec2 uRes;
uniform float uTime;
uniform sampler2D uTex;
uniform vec3 uHitWorldPos;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vWorldPos;

void main() {
  vec4 base = texture2D(uTex, vUv);
  gl_FragColor = base;
}