
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PendulumParameters {
  m1: number;
  m2: number;
  l1: number;
  l2: number;
  g: number;
  initialTheta1: number; // degrees
  initialPhi1: number; // degrees
  initialTheta2: number; // degrees
  initialPhi2: number; // degrees
  trailLength: number;
}

export interface PendulumState {
  p1: Vector3;
  p2: Vector3;
  trail: Vector3[];
  key: number;
}
