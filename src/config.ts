export default {
  handle: {
    /** Degrees per player interaction (task: 1 position = 60°) */
    stepDegrees: 60,
    turnDuration: 0.5,
    failureStepDegrees: 1200,
    failureDuration: 3.0,
  },
  offsets: {
    door: {
      closed: { x: 440, y: -40 },
      open: { x: 400, y: -40 },
    },
    handle: { x: -440, y: 0 },
    sparkles: {
      top: { x: 130, y: 100 },
      middle: { x: 140, y: -125 },
      bottom: { x: -170, y: 100 },
    },
    timer: { x: -460, y: -85 },
  },
};
