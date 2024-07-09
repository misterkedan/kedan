import * as KEDAN from 'kedan';
import { Demo } from './sketch/Demo';

const sketch = new Demo();
const sketchpad = new KEDAN.Sketchpad({
  debug: true,
});
sketchpad.open(sketch);

console.log({ kedan: { ...KEDAN }, sketchpad });
