type RawIFCProperty = {
  Name?: { value: string };
  NominalValue?: { value: unknown };
  [key: string]: unknown;
};

type PropertyMap = Record<string, unknown>;



/**
 * Typing of the model data: enum (custom values)
 * Tipizzazione dei dati da modello: enum (custom values)
 * per la descrizione del contenuto informativo
 * 
 * 
 */
export const Bd_funct = {
  Residential: "01",
  Commercial: "07",
  "Mixed use": "99",
  Industrial: "08",
  "Public building": "03",
  Education: "0303",
  "Other/Unknown occupancy type": "95"
} as const;

export const Bd_ch_ass = {
  Monumental: "01",
  "Non monumental": "02"
} as const;


/**
 * Typing of the model data: common attributes (reg types)
 * Tipizzazione dei dati da modello: attributi comuni (tipi standard)
 * per la descrizione del contenuto informativo
 * 
 * 
 */
export interface IBasicModel{
    bd_id: string
    bd_name: string
    bd_meta: string[]
    bd_url: URL
    bd_funct: string
    bd_nOcc: string
    bd_at: number
    bd_ch_ass: string
    bd_ch_sp: "Artistic"|"Landscape"|"Artistic, Landscape"|"None"
    bd_age: string
    bd_tecma: string
    bd_stype: "Moment frame"|"Wall"|"Dual frame-wall system"|"Braced frame"|"Other"
    bd_mant: string
    bd_ageSUp: string
    bd_ageBUp: string
}

/**
 * Description of the model data ready for the property table
 * Contenuto informativo da modello per la visualizzazione delle proprietà
 * 
 * 
 * 
 */
export class BasicModel implements IBasicModel{
    bd_id = "";
    bd_name = "";
    bd_meta: string[] = [];
    bd_url!: URL;
    bd_funct = "";
    bd_nOcc = "";
    bd_at = 0;
    bd_ch_ass = "";
    bd_ch_sp: "Artistic" | "Landscape" | "Artistic, Landscape" | "None" = "None";
    bd_age = "";
    bd_tecma = "";
    bd_stype: "Moment frame" | "Wall" | "Dual frame-wall system" | "Braced frame" | "Other" = "Other";
    bd_mant = "";
    bd_ageSUp = "";
    bd_ageBUp = "";

    constructor(dataArray: {}[]){
        const attributesToView=[
            "LongName"
        ];
        const propsToView=[
            // per 01-Building function
            "Residential",
            "Commercial",
            "Mixed use",
            "Industrial",
            "Public Building",
            "Education",
            "Other / unknown occupancy type",
            // per 02-Number of occupants
            "Number of occupants",
            // per 03-Cultural heritage asset
            "Artistic",
            "Landscape",
            // per 04-Age of construction 
            "Construction year",
            "Construction age",
            // per 05-Building techniques and materials
            "Building techniques and materials",
            // per 06-Structural type
            "Moment frame",
            "Wall",
            "Dual frame-wall system",
            "Braced frame",
            "Other",
            // per 08-Geometric features
            "Heigth of structure (m)",
            // per 09-General state of maintanance
            "General state of maintanance",
            // per 12-Age of retrofit: Structural upgrade
            "Structural upgrade",
            // per 12-Age of retrofit: Building upgrade
            "Building upgrade",
          ]
        let found_fba=this.found_byAttribute(attributesToView,dataArray);
        const found_byProps=(dataArray as RawIFCProperty[]).filter((a) => (typeof a.Name !== "undefined" && typeof a.NominalValue !== "undefined"))
        const result_fbp=found_byProps.filter((a) => (a.Name && this.isIncluded(propsToView,a.Name.value))==true) as {Name:{value: any}, NominalValue:{value: any}}[]
        const props=this.getPropertiesList(result_fbp);
        this.bd_id=this.getProjectId(found_fba) 
        this.bd_name=this.getProjectName(found_fba)
        this.bd_meta=[]
        
        this.forceProperties_1()
        
        this.getBuildingFunction(props)
        this.getNumberOfOccupants(props)
        this.getAssets(props)
        this.getConstructionAge(props)
        this.getBuildingTechAndMaterials(props)
        this.getStructuralType(props)
        this.getHeight(props)
        this.getStateOfMantainance(props)
        this.getStructuralUpgrade(props)
        this.getBuildingUpgrade(props)
    }

    isIncluded(arr: string[], a: string): boolean{
        return arr.includes(a);
    }

    private found_byAttribute(attributes: string[], dataArray: RawIFCProperty[]): RawIFCProperty[] {
        let result: RawIFCProperty[] = [];
        attributes.forEach(attr => {
            const found = dataArray.filter(a => a[attr] !== undefined);
            result = result.concat(found);
        });
        return result;
    }

    private getPropertiesList(result_fbp: RawIFCProperty[]): PropertyMap[] {

        const result: PropertyMap[] = [];

        result_fbp.forEach(element => {
            if (!element.Name?.value) return;

            result.push({
            [element.Name.value]: element.NominalValue?.value
            });
        });

        return result;
    }

    private getProjectId(found: RawIFCProperty[]): string {
        const first = found[0];
        return (first?.["Name"] as { value?: string })?.value ?? "";
    }

    private getProjectName(found: RawIFCProperty[]): string {
    const first = found[0];
    return (first?.["LongName"] as { value?: string })?.value ?? "";
    }

    getBuildingFunction(props:{}[]){
        //trova l'oggetto con key="Residential" or "..."
        let bf1=props.find((k) => Object.keys(k)[0] === "Residential")
        if (typeof bf1 !=="undefined"){
            const v=Object.keys(Bd_funct).find(
                (key): key is keyof typeof Bd_funct => Bd_funct[key as keyof typeof Bd_funct] === Bd_funct.Residential
              )
            if (v!=undefined){
                this.bd_funct=v
            }
            else{
                this.bd_funct=""
            }
            return
        }
        const bf2=props.find((k) => Object.keys(k)[0] === "Commercial")
        if (typeof bf2 !=="undefined"){
            const v=Object.keys(Bd_funct).find(
                (key): key is keyof typeof Bd_funct => Bd_funct[key as keyof typeof Bd_funct] === Bd_funct.Commercial
              )
            if (v!=undefined){
                this.bd_funct=v
            }
            else{
                this.bd_funct=""
            }
            return
        }
        const bf3=props.find((k) => Object.keys(k)[0] === "Mixed use")
        if (typeof bf3 !=="undefined"){
            const v=Object.keys(Bd_funct).find(
                (key): key is keyof typeof Bd_funct => Bd_funct[key as keyof typeof Bd_funct] === Bd_funct["Mixed use"]
              )
            if (v!=undefined){
                this.bd_funct=v
            }
            else{
                this.bd_funct=""
            }
            return
        }
        const bf4=props.find((k) => Object.keys(k)[0] === "Industrial")
        if (typeof bf4 !=="undefined"){
            const v=Object.keys(Bd_funct).find(
                (key): key is keyof typeof Bd_funct => Bd_funct[key as keyof typeof Bd_funct] === Bd_funct.Industrial
              )
            if (v!=undefined){
                this.bd_funct=v
            }
            else{
                this.bd_funct=""
            }
            return
        }
        const bf5=props.find((k) => Object.keys(k)[0] === "Public Building")
        if (typeof bf5 !=="undefined"){
            const v=Object.keys(Bd_funct).find(
                (key): key is keyof typeof Bd_funct => Bd_funct[key as keyof typeof Bd_funct] === Bd_funct["Public building"]
              )
            if (v!=undefined){
                this.bd_funct=v
            }
            else{
                this.bd_funct=""
            }
            return
        }
        const bf6=props.find((k) => Object.keys(k)[0] === "Education")
        if (typeof bf6 !=="undefined"){
            const v=Object.keys(Bd_funct).find(
                (key): key is keyof typeof Bd_funct => Bd_funct[key as keyof typeof Bd_funct] === Bd_funct.Education
              )
            if (v!=undefined){
                this.bd_funct=v
            }
            else{
                this.bd_funct=""
            }
            return
        }
        const bf7=props.find((k) => Object.keys(k)[0] === "Other / unknown occupancy type")
        if (typeof bf7 !=="undefined"){
            const v=Object.keys(Bd_funct).find(
                (key): key is keyof typeof Bd_funct => Bd_funct[key as keyof typeof Bd_funct] === Bd_funct["Other/Unknown occupancy type"]
              )
            if (v!=undefined){
                this.bd_funct=v
            }
            else{
                this.bd_funct=""
            }
            return
        }
    }

    getNumberOfOccupants(props:{}[]){
        //trova l'oggetto con key="Number of occupants"
        let filtered=props.find((k) => Object.keys(k)[0] === "Number of occupants")
        if (typeof filtered !=="undefined"){
            this.bd_nOcc=Object.values(filtered)[0] as string
            return
        }
    }

    getAssets(props:{}[]){
        let artistic=props.find((k) => Object.keys(k)[0] === "Artistic")
        if (typeof artistic !=="undefined"){
            const v=Object.keys(Bd_ch_ass).find(
                (key): key is keyof typeof Bd_ch_ass => Bd_ch_ass[key as keyof typeof Bd_ch_ass] === Bd_ch_ass.Monumental
              )
            if (v!=undefined){
                this.bd_ch_ass=v
            }
            else{
                this.bd_ch_ass=""
            }
            this.bd_ch_sp="Artistic"
        }
        let landscape=props.find((k) => Object.keys(k)[0] === "Landscape")
        if (typeof landscape !=="undefined"){
            const v=Object.keys(Bd_ch_ass).find(
                (key): key is keyof typeof Bd_ch_ass => Bd_ch_ass[key as keyof typeof Bd_ch_ass] === Bd_ch_ass.Monumental
              )
            if (v!=undefined){
                this.bd_ch_ass=v
            }
            else{
                this.bd_ch_ass=""
            }
            if(typeof(this.bd_ch_sp)!=="undefined"){
                this.bd_ch_sp.concat(", Landscape")
            }
            else{
                this.bd_ch_sp="Landscape"
            }
        }
        else{
            const v=Object.keys(Bd_ch_ass).find(
                (key): key is keyof typeof Bd_ch_ass => Bd_ch_ass[key as keyof typeof Bd_ch_ass] === Bd_ch_ass["Non monumental"]
              )
            if (v!=undefined){
                this.bd_ch_ass=v
            }
            else{
                this.bd_ch_ass=""
            }
            this.bd_ch_sp="None"
        }
    }

    getHeight(props:{}[]){
        let height=props.find((k) => Object.keys(k)[0] === "Heigth of structure (m)")
        if (typeof height !=="undefined"){
            this.bd_at=Math.round(Object.values(height)[0] as number * 100) / 100 
        }
    }

    getConstructionAge(props:{}[]){
        let year=props.find((k) => Object.keys(k)[0] === "Construction year")
        if (typeof year !=="undefined"){
            this.bd_age=Object.values(year)[0] as string
        }
        else{
            let age=props.find((k) => Object.keys(k)[0] === "Age of construction")
            if (typeof age !=="undefined"){
                this.bd_age=Object.values(age)[0] as string
            }
        }
    }

    getBuildingTechAndMaterials(props:{}[]){
        //trova l'oggetto con key="..."
        let filtered=props.find((k) => Object.keys(k)[0] === "Building techniques and materials")
        if (typeof filtered !=="undefined"){
            this.bd_tecma=Object.values(filtered)[0] as string
            return
        }
    }

    getStructuralType(props:{}[]){
        //trova l'oggetto con key="Residential" or "..."
        let bf1=props.find((k) => Object.keys(k)[0] === "Moment frame")
        if (typeof bf1 !=="undefined"){
            this.bd_stype="Moment frame"
            return
        }
        const bf2=props.find((k) => Object.keys(k)[0] === "Wall")
        if (typeof bf2 !=="undefined"){
            this.bd_stype="Wall"
            return
        }
        const bf3=props.find((k) => Object.keys(k)[0] === "Dual frame-wall system")
        if (typeof bf3 !=="undefined"){
            this.bd_stype="Dual frame-wall system"
            return
        }
        const bf4=props.find((k) => Object.keys(k)[0] === "Braced frame")
        if (typeof bf4 !=="undefined"){
            this.bd_stype="Braced frame"
            return
        }
        const bf5=props.find((k) => Object.keys(k)[0] === "Other")
        if (typeof bf5 !=="undefined"){
            this.bd_stype="Other"
            return
        }
    }

    getStateOfMantainance(props:{}[]){
        //trova l'oggetto con key="Number of occupants"
        let filtered=props.find((k) => Object.keys(k)[0] === "General state of maintanance")
        if (typeof filtered !=="undefined"){
            this.bd_mant=Object.values(filtered)[0] as string
            return
        }
    }

    getStructuralUpgrade(props:{}[]){
        //trova l'oggetto con key="Number of occupants"
        let filtered=props.find((k) => Object.keys(k)[0] === "Structural upgrade")
        if (typeof filtered !=="undefined"){
            this.bd_ageSUp=Object.values(filtered)[0] as string
            return
        }
    }

    getBuildingUpgrade(props:{}[]){
        //trova l'oggetto con key="Number of occupants"
        let filtered=props.find((k) => Object.keys(k)[0] === "Building upgrade")
        if (typeof filtered !=="undefined"){
            this.bd_ageBUp=Object.values(filtered)[0] as string
            return
        }
    }

    forceProperties_1(){
        this.bd_meta=["0590_01","0590_02"];
        //this.bd_meta=["ASR-Fondo edilizia privata","ASR-Fondo UDID"];
        
    }
   
    getLabel(key:string){
        switch (key){
            case "bd_id":
                return "ID"
            case "bd_name":
                return "Name"
            case "bd_meta":
                return "Metadata"
            case "bd_funct":
                return "Function"
            case "bd_nOcc":
                return "N. occupants"
            case "bd_at":
                return "Height [m]"
            case "bd_ch_ass":
                return "Assets"
            case "bd_ch_sp":
                return "Asset type"
            case "bd_age":
                return "Age of construction"
            case "bd_tecma":
                return "Technique and Materials"
            case "bd_stype":
                return "Structural Type"
            case "bd_mant":
                return "State of mantainance"
            case "bd_ageSUp":
                return "Age of Structural Upgrade"
            case "bd_ageBUp":
                return "Age of Building Upgrade"
            default:
                return ""
        }
    }
}