import * as BUI from "@thatopen/ui";
import { buildingsList } from "../../data/SourceList";
import { myMapBox } from "../Mapbox";
import { myimportJsonProps } from "../../classes/ExternalFiles";
import { BasicProps } from "../BasicProps";

//let curValue;
let curValue: string | null = null;
let curMap: myMapBox | null = null;

BUI.Manager.init();

const onDropDownChange = (e: Event):void => {
  const target = e.target as HTMLSelectElement|null;
  if (!target?.value) return;

  curValue = target.value;
  console.log("Dropdown value changed:", curValue);

  const parts = curValue[0].split(" ");
  const idByDd = Number(parts[1]);
  const selectedBuilding = buildingsList.find(
    (x) => x.buildingID === idByDd
  );

  if (!selectedBuilding) {
    console.warn("Building not found");
    return;
  }

  const container = document.getElementById(
    "viewer-container"
  ) as HTMLDivElement | null;

  if (!container) return;

  curMap = new myMapBox(container, selectedBuilding);
};

const onSARclick = () => {
  addSARlayer();
};

function addSARlayer() {
  if (!curValue || !curMap?.map) {
    alert("Please, select a building");
    return;
  }

  const parts = curValue[0].split(" ");
  const idByDd = Number(parts[1]);
  const selectedBuilding = buildingsList.find(
    (x) => x.buildingID === idByDd
  );

  if (!selectedBuilding) return;

  const selectedGeojson = selectedBuilding.geojsonFileName;

  if (!selectedGeojson || selectedGeojson === "not available") {
    alert("Data not available for the selected building");
    return;
  }

  // 2026 - evita errore se già esiste
    if (curMap.map.getSource("my_data")) {
      curMap.map.removeLayer("my_data_layer");
      curMap.map.removeSource("my_data");
    } //  2026 - fine

  curMap.map.addSource("my_data", {
    type: "geojson",
    data: `/sar/${selectedGeojson}`,
  }); 

  curMap.map.addLayer({
    id: "my_data_layer",
    type: "circle",
    source: "my_data",
    paint: {
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-color": "red",
      "circle-stroke-color": "white",
    },
  });

  curMap.map.moveLayer("my_data_layer");

  curMap.map.on("mouseenter", "my_data_layer", () => {
    if (curMap?.map) {
      curMap.map.getCanvas().style.cursor = "pointer";
    }
  });

if (curMap?.map) {
  curMap.map.getCanvas().style.cursor = "pointer";
}

  curMap.map.on("click", (e) => {
    if (!curMap?.map) return;

    const features = curMap.map.queryRenderedFeatures(e.point, {
      layers: ["my_data_layer"],
    });

    if (features.length > 0 && features[0].properties) {
      const myKV = features[0].properties as Record<string, any>;
      const nn = new BasicProps(curMap.viewer);

      for (const key in myKV) {
        nn.addBasicProp(key, myKV[key]);
      }
    }
  });
}

const onPropertyClick = async () => {
  const dropdown = document.getElementById(
    "myDropdown"
  ) as HTMLSelectElement | null;

  if (!dropdown?.value || !curMap) {
    alert("Please, select a building");
    return;
  }

  const selectedValue = dropdown.value;
  const parts = selectedValue[0].split(" ");
  const idByDd = Number(parts[1]);

  const selectedBuilding = buildingsList.find(
    (x) => x.buildingID === idByDd
  );

  if (!selectedBuilding) return;

  const currentPropBase = await myimportJsonProps(
    selectedBuilding.jsonFileName
  );

  const basicProps = new BasicProps(curMap.viewer);

  for (const key in currentPropBase) {
    const label =
      typeof currentPropBase.getLabel === "function"
        ? currentPropBase.getLabel(key)
        : key;

    const value = (currentPropBase as Record<string, any>)[key];
    basicProps.addBasicProp(label, value);
  }
};

const myPanel = BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-panel label="Analysis setup">
          <bim-dropdown label="Choose a building" @change=${onDropDownChange} id="myDropdown">
            <bim-option label="Building 1" ></bim-option>
            <bim-option label="Building 2"></bim-option>
            <bim-option label="Building 3"></bim-option>
            <bim-option label="Building 5"></bim-option>
            <bim-option label="Building 7"></bim-option>
            <bim-option label="Building 11"></bim-option>
            <bim-option label="Building 12"></bim-option>
            <bim-option label="Building 13"></bim-option>
            <bim-option label="Building 14"></bim-option>
            <bim-option label="Building 15"></bim-option>
            <bim-option label="Building 16"></bim-option>
            <bim-option label="Building 17"></bim-option>
            <bim-option label="Building 18"></bim-option>
            <bim-option label="Building 19"></bim-option>
            <bim-option label="Building 20"></bim-option>
            <bim-option label="Building 22"></bim-option>
            <bim-option label="Building 24"></bim-option>
            <bim-option label="Building 26"></bim-option>
            <bim-option label="Building 27"></bim-option>
            <bim-option label="Building 28"></bim-option>
            <bim-option label="Building 29"></bim-option>
            <bim-option label="Building 31"></bim-option>
            <bim-option label="Building 32"></bim-option>
            <bim-option label="Building 33"></bim-option>
            <bim-option label="Building 34"></bim-option>
            <bim-option label="Building 36"></bim-option>
            <bim-option label="Building 37"></bim-option>
            <bim-option label="Building 38"></bim-option>
          </bim-dropdown>
        <bim-button  label="Show properties" @click=${onPropertyClick}></bim-button>
        <bim-button  label="Show SAR: Descendent points" @click=${onSARclick}></bim-button>
        <bim-button  label="Show SAR: Ascendent points" @click=${onSARclick}></bim-button>
    </bim-panel>
    `;
});

var cbo=document.getElementById("cbo")
cbo?.append(myPanel)