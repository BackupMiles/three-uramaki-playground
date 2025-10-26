import type { Mesh } from "three";

export const isMesh = (obj: any): obj is Mesh => (obj as Mesh)?.type === 'Mesh'
