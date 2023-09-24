import { Camera } from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

function customGetPointer(this: any, event: any) {
  if (this.domElement.ownerDocument.pointerLockElement) {
    return {
      x: 0,
      y: 0,
      button: event.button,
    };
  } else {
    const rect = this.domElement.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / (rect.width / 2)) * 2 - 1,
      y: (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      button: event.button,
    };
  }
}

export class CustomTransformControls extends TransformControls {
  _getPointer: (this: any, event: any) => { x: number; y: number; button: any };

  constructor(camera: Camera, domElement: HTMLElement | undefined) {
    super(camera, domElement);
    this._getPointer = customGetPointer.bind(this);
  }
}
