import * as KEDAN from 'kedan';
import floatingCube from './floating-cube/sketch';

const sketchpad = new KEDAN.Sketchpad({
  debug: true,
});
sketchpad.open(floatingCube);

window.kedan = KEDAN;
window.sketchpad = sketchpad;
console.log({ kedan: { ...KEDAN }, sketchpad });
