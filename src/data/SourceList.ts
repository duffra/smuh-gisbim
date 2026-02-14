import { LoadModel } from './../classes/LoadModel';

const ed01=new LoadModel(1,"Edificio_01_PBP.ifc",[10.983632,45.448885],62.2541);
const ed02=new LoadModel(2,"Edificio_02_PBP.ifc",[10.983663,45.448586],62.1509)
const ed03=new LoadModel(3,"Edificio_03_PBP.ifc",[10.983622,45.448378],62.2598);
const ed05=new LoadModel(5,"Edificio_05_PBP.ifc",[10.983525,45.446989],61.9810);
//const ed06=new LoadModel(6,"Edificio_06_PBP.ifc",[10.983443,45.446649],61.7846)
const ed07=new LoadModel(7,"Edificio_07_PBP.ifc",[10.983368,45.446333],61.8391);
const ed11=new LoadModel(11,"Edificio_11_PBP.ifc",[10.983001,45.444298],61.4818);
const ed12=new LoadModel(12,"Edificio_12_PBP.ifc",[10.983091,45.444021],60.7788);
const ed13=new LoadModel(13,"Edificio_13_PBP.ifc",[10.983541,45.443755],59.4547);
const ed14=new LoadModel(14,"Edificio_14_PBP.ifc",[10.98353,45.443404],59.6058);
const ed15=new LoadModel(15,"Edificio_15_PBP.ifc",[10.983908,45.443113],60.4877);
const ed16=new LoadModel(16,"Edificio_16_PBP.ifc",[10.984063,45.442658],60.8500);
const ed17=new LoadModel(17,"Edificio_17_PBP.ifc",[10.984306,45.442385],60.6716,"B_17_CSK_VERONA_D_2024.geojson");
const ed18=new LoadModel(18,"Edificio_18_PBP.ifc",[10.984958,45.441927],59.5409,"B_18_CSK_VERONA_D_2024.geojson");
const ed19=new LoadModel(19,"Edificio_19_PBP.ifc",[10.987501,45.441293],60.4780);
const ed20=new LoadModel(20,"Edificio_20_PBP.ifc",[10.987808,45.441313],60.5406);
const ed22=new LoadModel(22,"Edificio_22_PBP.ifc",[10.988747,45.441711],60.2112);
const ed24=new LoadModel(24,"Edificio_24_PBP.ifc",[10.989306,45.44213],59.8464);
const ed26=new LoadModel(26,"Edificio_26_PBP.ifc",[10.989839,45.442427],60.1871);
const ed27=new LoadModel(27,"Edificio_27_PBP.ifc",[10.990087,45.442675],60.4057);
const ed28=new LoadModel(28,"Edificio_28_PBP.ifc",[10.990278,45.44288],60.9532);
const ed29=new LoadModel(29,"Edificio_29_PBP.ifc",[10.990744,45.443422],60.6127);
const ed31=new LoadModel(31,"Edificio_31_PBP.ifc",[10.991353,45.444239],60.1264);
const ed32=new LoadModel(32,"Edificio_32_PBP.ifc",[10.991558,45.444834],59.3335);
const ed33=new LoadModel(33,"Edificio_33_PBP.ifc",[10.992012,45.445054],60.1187);
const ed34=new LoadModel(34,"Edificio_34_PBP.ifc",[10.992088,45.445183],60.1187);
const ed36=new LoadModel(36,"Edificio_36_PBP.ifc",[10.992626,45.446097],60.2534);
const ed37=new LoadModel(37,"Edificio_37_PBP.ifc",[10.992626,45.446097],60.2534);
const ed38=new LoadModel(38,"Edificio_38_PBP.ifc",[10.992832,45.446418],59.9440);

export const buildingsList=[
    ed01,ed02,ed03,ed05,ed07,ed11,ed12,ed13,ed14,ed15,ed16,ed17,ed18,ed19,
    ed20,ed22,ed24,ed26,ed27,ed28,ed29,
    ed31,ed32,ed33,ed34,ed36,ed37,ed38]

/**
 * Selected model for the integrated viewer: GIS/BIM
 * Modello visualizzato nel viewer integrato GIS/BIM
 */
export const curData=ed17;

export const getBuildingByDropdown = (ddvalue:string)=>{
    const idByDd=Number(ddvalue.split(" ")[1])
    buildingsList.forEach(b => {
        if(b.buildingID==idByDd){
            return b
        }
    });
}

