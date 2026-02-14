import * as OBC from "openbim-components";
import { curData } from "../data/SourceList";
import { LoadModel } from "./LoadModel";

/**
 * Load an IFC file and convert it to fragments
 */

async function loadIfcToScene(
  components: OBC.Components,
  scene: THREE.Scene,
  ifcFileName: string
): Promise<void> {
  if (!ifcFileName) {
    throw new Error("Invalid IFC file name");
  }

  const ifcLoader = new OBC.FragmentIfcLoader(components);

  ifcLoader.settings.wasm = {
    path: "https://unpkg.com/web-ifc@0.0.44/",
    absolute: true,
  };

  ifcLoader.settings.webIfc = {
    COORDINATE_TO_ORIGIN: false,
  };

  const response = await fetch(ifcFileName);

  if (!response.ok) {
    throw new Error(`Failed to fetch IFC file: ${response.statusText}`);
  }

  const fileNameWithoutExt =
    ifcFileName.split(".").slice(0, -1).join(".") || "model";

  const data = await response.arrayBuffer();
  const buffer = new Uint8Array(data);

  const model = await ifcLoader.load(buffer, fileNameWithoutExt);

  scene.add(model);
}

/**
 * Load default IFC (curData)
 */
export async function convertSingleIfcToFragments_BackEnd(
  components: OBC.Components,
  scene: THREE.Scene
): Promise<void> {
  await loadIfcToScene(components, scene, curData.ifcFileName);
}

/**
 * Load selected IFC
 */
export async function convertSelectedIfcToFragments_BackEnd(
  components: OBC.Components,
  scene: THREE.Scene,
  selData: LoadModel
): Promise<void> {
  if (!selData?.ifcFileName) {
    throw new Error("Selected data does not contain a valid IFC file name");
  }

  await loadIfcToScene(components, scene, selData.ifcFileName);
}
