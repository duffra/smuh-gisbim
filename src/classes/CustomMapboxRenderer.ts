import * as THREE from "three";
import * as mapboxgl from "mapbox-gl";
import * as OBC from "openbim-components";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { Event, BaseRenderer } from "openbim-components/base-types";
import { convertSelectedIfcToFragments_BackEnd } from "./GeneralTools_Generate";
import { myimportJsonProps } from "./ExternalFiles";
import { BasicProps } from "../bim-components/BasicProps";
import { LoadModel } from "./LoadModel";

type ModelTransform = {
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
};

export class CustomMapboxRenderer extends BaseRenderer {
  enabled = true;

  onBeforeUpdate = new Event<unknown>();
  onAfterUpdate = new Event<unknown>();
  onInitialized = new Event<THREE.WebGLRenderer>();

  private _labelRenderer: CSS2DRenderer;
  private _renderer!: THREE.WebGLRenderer;
  private _initError = "Mapbox scene isn't initialized yet!";

  private _components: OBC.Components;
  private _map: mapboxgl.Map | null;
  private _modelTransform: ModelTransform;

  constructor(
    components: OBC.Components,
    map: mapboxgl.Map,
    coords: mapboxgl.MercatorCoordinate,
    layer: string,
    selData: LoadModel,
    rotation: THREE.Vector3 = new THREE.Vector3(Math.PI / 2, 0, 0)
  ) {
    super(components);

    this._components = components;
    this._map = map;
    this._labelRenderer = new CSS2DRenderer();
    this._modelTransform = this.newModelTransform(coords, rotation);

    this.setupMap(map, layer, selData);
  }

  get(): THREE.WebGLRenderer {
    if (!this._renderer) throw new Error(this._initError);
    return this._renderer;
  }

  getSize(): THREE.Vector2 {
    if (!this._renderer) throw new Error(this._initError);

    return new THREE.Vector2(
      this._renderer.domElement.clientWidth,
      this._renderer.domElement.clientHeight
    );
  }

  resize(): void {}

  async dispose(): Promise<void> {
    this.onInitialized.reset();
    this.enabled = false;
    this.setupEvents(false);

    this._renderer?.dispose();
    this._map?.remove();
    this._map = null;
  }

  private initialize(context: WebGLRenderingContext): void {
    if (!this._map) return;

    const canvas = this._map.getCanvas();

    this._renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      antialias: true,
    });

    this._renderer.autoClear = false;

    this.initializeLabelRenderer();
    this.onInitialized.trigger(this._renderer);
  }

  private setupMap(
    map: mapboxgl.Map,
    layer: string,
    selectedData: LoadModel
  ): void {
    const scene = this._components.scene.get();

    const onAdd: mapboxgl.CustomLayerInterface["onAdd"] = async (
      _map,
      gl
    ) => {
      this.initialize(gl as WebGLRenderingContext);

      await convertSelectedIfcToFragments_BackEnd(
        this._components,
        scene,
        selectedData
      );

      const currentPropBase = await myimportJsonProps(
        selectedData.jsonFileName
      );

      const basicProps = new BasicProps(this._components);

      const props = currentPropBase as unknown as Record<string, unknown>;

      for (const key in props) {
        const label =
          typeof (currentPropBase as any).getLabel === "function"
            ? (currentPropBase as any).getLabel(key)
            : key;

        basicProps.addBasicProp(label, String(props[key]));
      }
    };

    const render: mapboxgl.CustomLayerInterface["render"] = (
      _gl,
      matrix
    ) => {
      this.render(scene, matrix as number[]);
    };

    const customLayer: mapboxgl.CustomLayerInterface =
      this.newMapboxLayer(onAdd, render, layer);

    map.on("style.load", () => {
      map.addLayer(customLayer, "waterway-label");
    });
  }

  private newMapboxLayer(
    onAdd: mapboxgl.CustomLayerInterface["onAdd"],
    render: mapboxgl.CustomLayerInterface["render"],
    layer: string
  ): mapboxgl.CustomLayerInterface {
    return {
      id: layer,
      type: "custom",
      renderingMode: "3d",
      onAdd,
      render,
    };
  }

  private newModelTransform(
    coords: mapboxgl.MercatorCoordinate,
    rotation: THREE.Vector3
  ): ModelTransform {
    return {
      translateX: coords.x,
      translateY: coords.y,
      translateZ: coords.z ?? 0,
      rotateX: rotation.x,
      rotateY: rotation.y,
      rotateZ: rotation.z,
      scale: coords.meterInMercatorCoordinateUnits(),
    };
  }

  render(scene: THREE.Scene, matrix: number[]): void {
    if (!this._renderer || !this.enabled || !this._map) return;

    this.onBeforeUpdate.trigger(this);

    const rotationX = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      this._modelTransform.rotateX
    );

    const rotationY = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      this._modelTransform.rotateY
    );

    const rotationZ = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 1),
      this._modelTransform.rotateZ
    );

    const m = new THREE.Matrix4().fromArray(matrix);

    const l = new THREE.Matrix4()
      .makeTranslation(
        this._modelTransform.translateX,
        this._modelTransform.translateY,
        this._modelTransform.translateZ
      )
      .scale(
        new THREE.Vector3(
          this._modelTransform.scale,
          -this._modelTransform.scale,
          this._modelTransform.scale
        )
      )
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);

    const camera = this._components.camera.get();
    camera.projectionMatrix = m.multiply(l);

    this._renderer.resetState();
    this._renderer.render(scene, camera);
    this._labelRenderer.render(scene, camera);

    this._map.triggerRepaint();
    this.onAfterUpdate.trigger(this);
  }

  private initializeLabelRenderer(): void {
    this.updateLabelRendererSize();
    this.setupEvents(true);

    this._labelRenderer.domElement.style.position = "absolute";
    this._labelRenderer.domElement.style.top = "0px";

    this._renderer.domElement.parentElement?.appendChild(
      this._labelRenderer.domElement
    );
  }

  private updateLabelRendererSize = (): void => {
    if (this._renderer?.domElement) {
      this._labelRenderer.setSize(
        this._renderer.domElement.clientWidth,
        this._renderer.domElement.clientHeight
      );
    }
  };

  private setupEvents(active: boolean): void {
    if (active) {
      window.addEventListener("resize", this.updateLabelRendererSize);
    } else {
      window.removeEventListener("resize", this.updateLabelRendererSize);
    }
  }
}
