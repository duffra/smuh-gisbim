/**
 * Typing of the input model
 * Tipizzazione del modello di input da visualizzare
 * 
 * 
 */
export class LoadModel{
    buildingID: number
    ifcFileName: string
    fragFileName: string
    jsonFileName: string
    metaFileName: string
    modelOrigin: number[]
    modelAltitude: number
    geojsonFileName: string
    
    constructor(buildingID:number,ifcName: string,modelOrigin:number[],modelAltitude:number=0,geojsonName?:string, fragName?:string,jsonName?:string,metaFileName?:string) {
        this.buildingID=buildingID;
        this.ifcFileName=ifcName;
        if (geojsonName==null){
            this.geojsonFileName="not available";
        }
        else{
            this.geojsonFileName=geojsonName
        }
        if (fragName==null){
            this.fragFileName=ifcName.replace(".ifc", ".frag");
        }
        else{
            this.fragFileName=fragName
        }
        if (jsonName==null){
            this.jsonFileName=ifcName.replace(".ifc", ".json");;
        }
        else{
            this.jsonFileName=jsonName
        }
        this.modelOrigin=modelOrigin;
        this.modelAltitude= modelAltitude;
        if(metaFileName){
            this.metaFileName=metaFileName
        }
        else{
            this.metaFileName="";
        }
    }
}