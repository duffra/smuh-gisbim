import { myMapBox } from "./bim-components/Mapbox";
import { LoadModel } from "./classes/LoadModel";

//Main file: app launch this code
const container=document.getElementById('viewer-container') as HTMLDivElement
const emptyModel=new LoadModel(999, "", [999,999])
new myMapBox(container,emptyModel)