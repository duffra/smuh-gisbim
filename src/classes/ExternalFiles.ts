import { FragmentsGroup } from "bim-fragment";
import { BasicModel } from "./BasicModel";

/**
 * Export data from ifc file
 * (Download .json)
 */
export function exportJsonProps(model: FragmentsGroup): void {
  if (!model?.properties) {
    console.warn("Model has no properties to export.");
    return;
  }

  const json = JSON.stringify(model.properties, null, 2);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;

  const fileName =
    typeof model.name === "string"
      ? model.name.replace(".ifc", "")
      : "model-properties";

  a.download = `${fileName}.json`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/**
 * Fetch data from json file
 * and return them as a BasicModel
 */
export async function myimportJsonProps(
  jsonFileName: string
): Promise<BasicModel> {
  if (!jsonFileName) {
    throw new Error("Invalid JSON file name");
  }

  const response = await fetch(jsonFileName);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch JSON file: ${response.status} ${response.statusText}`
    );
  }

  const data: unknown = await response.json();

  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid JSON structure");
  }

  const dataArray = Object.values(
    data as Record<string, unknown>
  ) as Record<string, unknown>[];

  return new BasicModel(dataArray);
}
