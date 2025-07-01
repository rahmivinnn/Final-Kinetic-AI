import { Keypoint } from '@tensorflow-models/pose-detection';

// Define the connection pairs for drawing skeleton
const POSE_CONNECTIONS = [
  // Face
  [0, 1], [0, 2], [1, 3], [2, 4],
  // Torso
  [5, 6], [5, 7], [5, 11], [6, 8], [6, 12], [7, 9], [8, 10], [11, 12],
  // Right arm
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  // Left arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  // Right leg
  [23, 25], [25, 27], [27, 29], [29, 31],
  // Left leg
  [24, 26], [26, 28], [28, 30], [30, 32],
  // Feet
  [31, 32],
  // Hands
  [19, 21], [20, 22]
];

/**
 * Draws keypoints on a canvas
 */
export function drawKeypoints(
  keypoints: Keypoint[],
  minConfidence: number,
  ctx: CanvasRenderingContext2D,
  scale = 1,
  color = 'aqua'
) {
  const keypointInd = {
    nose: 0,
    leftEye: 1,
    rightEye: 2,
    leftEar: 3,
    rightEar: 4,
    leftShoulder: 5,
    rightShoulder: 6,
    leftElbow: 7,
    rightElbow: 8,
    leftWrist: 9,
    rightWrist: 10,
    leftHip: 11,
    rightHip: 12,
    leftKnee: 13,
    rightKnee: 14,
    leftAnkle: 15,
    rightAnkle: 16,
  };

  const keypointsArray = keypoints;

  for (let i = 0; i < keypointsArray.length; i++) {
    const keypoint = keypointsArray[i];

    if (keypoint.score && keypoint.score < minConfidence) {
      continue;
    }

    const { y, x } = keypoint;
    drawPoint(ctx, y * scale, x * scale, 3, color);
  }
}

/**
 * Draws a point on a canvas
 */
function drawPoint(
  ctx: CanvasRenderingContext2D,
  y: number,
  x: number,
  r: number,
  color: string
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draws a line on a canvas
 */
function drawSegment(
  [ay, ax]: [number, number],
  [by, bx]: [number, number],
  color: string,
  scale: number,
  ctx: CanvasRenderingContext2D
) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.stroke();
}

/**
 * Draws the skeleton of a body on a canvas
 */
export function drawSkeleton(
  keypoints: Keypoint[],
  minConfidence: number,
  ctx: CanvasRenderingContext2D,
  scale = 1,
  color = 'aqua'
) {
  const keypointsArray = keypoints;
  const posePairs = POSE_CONNECTIONS;

  for (let i = 0; i < posePairs.length; i++) {
    const pair = posePairs[i];
    const [startIdx, endIdx] = pair;

    const startKeypoint = keypointsArray[startIdx];
    const endKeypoint = keypointsArray[endIdx];

    if (
      !startKeypoint ||
      !endKeypoint ||
      (startKeypoint.score && startKeypoint.score < minConfidence) ||
      (endKeypoint.score && endKeypoint.score < minConfidence)
    ) {
      continue;
    }

    drawSegment(
      [startKeypoint.y, startKeypoint.x],
      [endKeypoint.y, endKeypoint.x],
      color,
      scale,
      ctx
    );
  }
}
