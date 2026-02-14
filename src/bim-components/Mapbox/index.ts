import * as MAPBOX from "mapbox-gl";
import * as THREE from "three";

import * as OBC from "openbim-components"
import {MapboxCamera} from "openbim-components/integrations/mapbox/src/mapbox-camera"

import mapboxgl from "mapbox-gl";
import { CustomMapboxRenderer } from "../../classes/CustomMapboxRenderer";
import { LoadModel } from "../../classes/LoadModel";


const maxBounds = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(10.9752845,45.4379765),
  new mapboxgl.LngLat(10.998963,45.458596)
);

const baseCenter= [10.987760, 45.443797];

export interface Disposable {
    /**
     * Destroys the object from memory to prevent a
     * [memory leak](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects).
     */
    dispose: () => Promise<void>;
}

/**
 * Default Mapbox state 
 */
export interface MapboxState {
    pitch: number;
    bearing: number;
    zoom: number | null;
    center: number[];
    style: string;
    antialias: boolean;
    maxZoom?: number | null;
    minZoom?: number | null;
    maxBounds?: MAPBOX.LngLatBoundsLike
}

/**
 * Mapbox state: Verona Borgo Trento
 */
export const defaultInitialState: MapboxState = {
    pitch: 62.07, //70.16,
    bearing: -17.69, //12.77,
    zoom: 16.28, //16.43,
    center: baseCenter,
    style: 
      'mapbox://styles/duffra/cm5a30snz00jr01sfcudm5jd2',
    antialias: true,
    maxZoom: 60,
    minZoom: 3,
    maxBounds: maxBounds,
};  

/**
 * Mapbox implementation: GIS+BIM
 */
export class myMapBox implements Disposable{
    map: MAPBOX.Map | null;
    selectedData: LoadModel
    viewer = new OBC.Components()
    private container: HTMLDivElement
    renderer: any;
    labelRenderer: any;

    private readonly accessToken = import.meta.env.VITE_MBOXTOKEN
    constructor( container: HTMLDivElement, selData:LoadModel) {
        this.container = container
        var center =  baseCenter as [number, number]
        this.selectedData=selData
        if (selData.buildingID!= 999){
          center=selData.modelOrigin as [number, number]
        }
        var zoom = 16.43
        if (selData.buildingID!= 999){
          zoom=18
        }
        var myInitialState = {
            pitch: 62.07, //70.16,
            bearing: -17.69, //12.77,
            zoom: zoom,
            center: center,
            style: 
            'mapbox://styles/duffra/cm5a30snz00jr01sfcudm5jd2', 
            antialias: true,
            maxZoom: 60,
            minZoom: 3,
            maxBounds: maxBounds
        }
        this.map = new MAPBOX.Map( { container: this.container, accessToken: this.accessToken, ...myInitialState }) //Funziona, avvisi di TS...
        this.setupDTMonMap();
        //this.map.flyTo({
            //center: selData.modelOrigin as [number, number]
        //});
        if(selData.buildingID!= 999){
          const curLayer=this.createCustomLayer(selData);
          const _this=this;
          this.map.on('style.load', () => {
            this.setFilter();
            if (_this.map !== null) {
              _this.map.addLayer(curLayer)
              //_this.addSARlayer()
              _this.map.on('click', e => {
                curLayer.raycast(e.point, this);
              });
            }
        });
        }
    }
    async dispose() {
        this.renderer.dispose();
        this.labelRenderer.domElement.remove()
        //this.fragmentModel?.dispose()
        if (this.map==null) return
        this.map.remove()
        this.map = null
    }

    private createCustomLayer(curData: LoadModel){
        const modelRotate = [Math.PI / 2, 0, 0];
        const modelAsMercatorCoordinate_base = mapboxgl.MercatorCoordinate.fromLngLat(
            { lng: curData.modelOrigin[0], lat: curData.modelOrigin[1] },
            curData.modelAltitude
        );
    
        const modelTransform_base = {
            translateX: modelAsMercatorCoordinate_base.x,
            translateY: modelAsMercatorCoordinate_base.y,
            translateZ: modelAsMercatorCoordinate_base.z,
            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],
            /* Since the 3D model is in real world meters, a scale transform needs to be
             * applied since the CustomLayerInterface expects units in MercatorCoordinates.
             */
            scale: modelAsMercatorCoordinate_base.meterInMercatorCoordinateUnits()
        };
    
        const layerName_base=curData.ifcFileName.split("_")[0]+curData.ifcFileName.split("_")[1]
        const layerName_renderer=curData.ifcFileName.split("_")[1]
        
        //const viewer = new OBC.Components()
        //this.viewer.dispose();
        const viewer= new OBC.Components() 
        this.viewer=viewer
        const sceneComponent = new OBC.SimpleScene(viewer)
        sceneComponent.setup()
        viewer.scene = sceneComponent
        
        const viewerContainer = document.getElementById("viewer-container") as HTMLDivElement
        const rendererComponent = new OBC.PostproductionRenderer(viewer,viewerContainer)
        viewer.renderer = rendererComponent
        
        const cameraComponent = new MapboxCamera(viewer)
        viewer.camera = cameraComponent;
        
        const raycasterComponent=new OBC.SimpleRaycaster(viewer);
        viewer.raycaster = raycasterComponent
        var raycaster=viewer.raycaster.get()
        raycaster.near = -1;
        raycaster.far = 1e6;
        
        viewer.init()
        
        if (this.map === null) return 
        const rendererComponentMB = new CustomMapboxRenderer(viewer,this.map,modelAsMercatorCoordinate_base,layerName_renderer, this.selectedData)
        viewer.renderer = rendererComponentMB
    
        // configuration of the custom layer for a 3D model per the CustomLayerInterface
        const customLayer_base: any = {
          id: layerName_base,
          type: 'custom',
          renderingMode: '3d',
          onAdd: async function (map: MAPBOX.Map, gl: WebGLRenderingContext) {
            var layers = map.getStyle().layers;
            const customL=layers.filter(layer=> layer.type==='custom')

            console.log(customL)  
            this.scene=sceneComponent.get()
              this.scene.background=null
              // create two three.js lights to illuminate the model
              const directionalLight = new THREE.DirectionalLight(0xffffff);
              directionalLight.position.set(0, -70, 100).normalize();
              this.scene.add(directionalLight);
        
              this.renderer=viewer.renderer.get()
              this.renderer.autoClear = false;
              this.renderer.canvas=map.getCanvas()
              this.renderer.context=gl
              this.renderer.antialias=true
              
              this.camera=viewer.camera.get()
        
              this.map = map;
          },
          render: function (_gl: WebGLRenderingContext, matrix: number[]) {
              const rotationX = new THREE.Matrix4().makeRotationAxis(
                  new THREE.Vector3(1, 0, 0),
                  modelTransform_base.rotateX
              );
              const rotationY = new THREE.Matrix4().makeRotationAxis(
                  new THREE.Vector3(0, 1, 0),
                  modelTransform_base.rotateY
              );
              const rotationZ = new THREE.Matrix4().makeRotationAxis(
                  new THREE.Vector3(0, 0, 1),
                  modelTransform_base.rotateZ
              );
        
              const m = new THREE.Matrix4().fromArray(matrix);
              const l = new THREE.Matrix4()
                  .makeTranslation(
                    modelTransform_base.translateX,
                    modelTransform_base.translateY,
                    modelTransform_base.translateZ as number
                  )
                  .scale(
                      new THREE.Vector3(
                        modelTransform_base.scale,
                          -modelTransform_base.scale,
                          modelTransform_base.scale
                      )
                  )
                  .multiply(rotationX)
                  .multiply(rotationY)
                  .multiply(rotationZ);
        
              this.camera.projectionMatrix = m.multiply(l);
              this.renderer.resetState();
              this.renderer.render(this.scene, this.camera);
              this.map.triggerRepaint();
          },
          async raycast(_point: any) {
            //NON CANCELLARE
          } 
        }; 
        return customLayer_base
    }

    private async setupDTMonMap() {
      if (this.map==null) return
      
      this.map.on( "style.load", () => {
          if (this.map==null) return
          this.map.addSource('DTMconvertito-ae00uw', {
              'type': 'raster-dem',
              'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
              'tileSize': 512,
              'maxzoom': 14
          });
          // add the DEM source as a terrain layer
          this.map.setTerrain({ 'source': 'DTMconvertito-ae00uw', 'exaggeration': 1});

          /* TEST PER INTERAZIONE CON PUNTI SAR
          //Aggiungi 'my_data'
          this.map.addSource('my_data', {
            type: 'geojson', 
            data: `/sar/B_18_CSK_VERONA_D_2024.geojson`, 
          });
          
          this.map.addLayer({
            id: 'my_data_layer',
            type: 'circle', // or 'circle', 'symbol' etc.
            source: 'my_data',
            paint: {
                'circle-radius': 3,
                'circle-stroke-width': 1,
                'circle-color': 'red',
                'circle-stroke-color': 'white'
            },
            // ... other layer properties
          });
      } );
       this.map?.on("mouseenter", "my_data_layer", (e) => {
        this.map.getCanvas().style.cursor= "pointer";
        const features=e.features
      });
      this.map?.on('click', (e)=>{
        const features=this.map.queryRenderedFeatures(e.point,{
          layers: ['my_data_layer']
        })
        console.log(features)
      } 
      )
      */
      
      this.map.addControl( new MAPBOX.NavigationControl( {
          visualizePitch: true,
      } ), 'bottom-right' );
    })}
  

    private setFilter(){
    //this.map.setFilter('ADG_Edifici_DTMgronda', ['!=', ['get', 'bd_id'], curData.buildingID]);
    if (this.map === null) return;
    this.map.setFilter('ADG_Edifici_DTMgronda', ['!=', ['get', 'bd_id'], this.selectedData.buildingID]);
    }

}
