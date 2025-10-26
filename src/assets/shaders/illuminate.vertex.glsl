varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  vec4 modelPosition = vec4(position, 1.0)* modelMatrix;
  vWorldPos = modelPosition.xyz;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
