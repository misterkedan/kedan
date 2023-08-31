// Controllers
export { Presentation } from './controllers/Presentation';
export { Ticker } from './controllers/Ticker';

// Controls
export { CanvasResizer } from './controls/CanvasResizer';
export { GUI } from './controls/GUI';
export { KeyboardShortcuts } from './controls/KeyboardShortcuts';
export { NavigationArrows } from './controls/NavigationArrows';
export { PointerTracker } from './controls/PointerTracker';
export { Swiper } from './controls/Swiper';

// DOM
export { StyleToggler } from './dom/StyleToggler';
export { VisibilityToggler } from './dom/VisibilityToggler';
export * as DOMUtils from './dom/DOMUtils';
export * from './dom/DOMUtils';

// Random
export { Random } from './random/Random';
export { Simplex } from './random/Simplex';

// Utils
export * as TextUtils from './utils/TextUtils';
export * as Utils from './utils/Utils';
export * from './utils/TextUtils';
export * from './utils/Utils';

/*-----------------------------------------------------------------------------/
  GLSL
/-----------------------------------------------------------------------------*/

import GLSL_parabola from './glsl/functions/parabola.glsl';

import GLSL_bayerDither from './glsl/gradients/bayerDither.glsl';
import GLSL_linearGradient from './glsl/gradients/linearGradient.glsl';
import GLSL_radialGradient from './glsl/gradients/radialGradient.glsl';

import GLSL_simplex2D from './glsl/random/simplex2D.glsl';
import GLSL_simplex3D from './glsl/random/simplex3D.glsl';
import GLSL_simplex4D from './glsl/random/simplex4D.glsl';

import GLSL_basicVaryingUV_vertex from './glsl/shaders/basicVaryingUV.vertex.glsl';

import GLSL_rotateX from './glsl/transform/rotateX.glsl';
import GLSL_rotateY from './glsl/transform/rotateY.glsl';
import GLSL_rotateZ from './glsl/transform/rotateZ.glsl';
import GLSL_scale from './glsl/transform/scale.glsl';

import GLSL_lookAt from './glsl/lookAt.glsl';
import GLSL_loopValue from './glsl/loopValue.glsl';
import GLSL_packFloat from './glsl/packFloat.glsl';
import GLSL_unpackFloat from './glsl/unpackFloat.glsl';

export {
  GLSL_parabola,
  GLSL_bayerDither,
  GLSL_linearGradient,
  GLSL_radialGradient,
  GLSL_simplex2D,
  GLSL_simplex3D,
  GLSL_simplex4D,
  GLSL_basicVaryingUV_vertex,
  GLSL_rotateX,
  GLSL_rotateY,
  GLSL_rotateZ,
  GLSL_scale,
  GLSL_lookAt,
  GLSL_loopValue,
  GLSL_packFloat,
  GLSL_unpackFloat,
};

/*-----------------------------------------------------------------------------/
  Three
/-----------------------------------------------------------------------------*/

// Backgrounds
export { Background } from './three/background/Background';
export { LinearGradientBackground } from './three/background/LinearGradientBackground';
export { RadialGradientBackground } from './three/background/RadialGradientBackground';
export { SimplexGradientBackground } from './three/background/SimplexGradientBackground';

// Controls
export { CameraRig } from './three/controls/CameraRig';
export { PointerProjector } from './three/controls/PointerProjector';

// GPGPU
export { GPGPU } from './three/gpgpu/GPGPU';
export { GPGPUConstant } from './three/gpgpu/GPGPUConstant';
export { GPGPUVariable } from './three/gpgpu/GPGPUVariable';

// Post-processing
export { BloomPass } from './three/postprocessing/BloomPass';
export { FXAAPass } from './three/postprocessing/FXAAPass';
export { RadialBlurPass } from './three/postprocessing/RadialBlurPass';

// Utils
export { CameraBounds } from './three/utils/CameraBounds';

export * as ThreeUtils from './three/utils/ThreeUtils';
export * from './three/utils/ThreeUtils';
