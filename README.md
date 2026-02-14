<a id="readme-top"></a>
<!-- ABOUT THE PROJECT -->
## About The Project
This project one of the Work Packages for [SMUH](https://smuh.org/info/): Safeguard of Modern Urban Heritage: a cross-disciplinary WebGIS for Knowledge, Monitoring and Risk Analysis.

The project aims at the preservation and cultural valorization of modern urban heritage combining historical-technical surveys, satellite monitoring and advanced digital platforms for spatial analysis and data representation.
<!-- GETTING STARTED -->
## Getting Started
If you want to set up your project locally, feel free to get a local copy up and running follow these simple example steps.

### Prerequisites
You need a basic case study, requiring BIM and GIS resources. Basic samples are included in this repo for testing purpose; if you want to customize the viewer having a basic understanding of BIM modelling and IFC it's a plus, because you will need to model and export properties according to your specific needs.

These are the kind of files you need to run this application:

* .ifc of your building. _You can use mine for testing purpose_
* .json file defining the properties of your model, extracted by an ifc model using That Open Engine. _You can use mine for testing purpose_
* mapbox token, mandatory.

### Installation

_This application relies on external libraries which will be installed locally._

1. Get a free API Key for [Mapbox](https://account.mapbox.com/auth/signup/?page=/) library 
2. Download or clone this repo
   ```sh
   git clone https://github.com/duffra/smuh-gisbim.git
   ```
3. Install NPM packages. Required dependencies are automatically installed locally. 
   ```sh
   npm install
   ```
4. Enter your Mapbox token in `.env` [.env](.env#1) to setup the required environment variables
   ```js
   VITE_MBOXTOKEN = 'ENTER YOUR API';
   ```
<!-- USAGE EXAMPLES -->
## Usage
It's time to assemble the code and run the app to get your BIM-GIS viewer.
1. Make sure you have .ifc files and .json files in the public folder. You can take mines or replace with your resources.
2. Add your own data in [SourceList](src/data/SourceList.ts) to setup the resources to be used. This is an example of how to compile the list:
   ```js
   const ed17=new LoadModel(17,"Edificio_17_PBP.ifc",[10.984306,45.442385],60.6716,"B_17_CSK_VERONA_D_2024.geojson");
   ```
   You must specify:
   - id as a number
   - the name of the ifc model (as the one in the public folder)
   - model origin coordinates as an array
   - model altitude as a number
   
   You can integrate:
   - geojson files to integrate SAR data.

3. Complete and export the array with your buildings in [buildingsList](src/data/SourceList.ts#L33) to setup the resources to be used. This is an example of how to compile the list:
   ```js
   export const buildingsList=[ed17,ed18];
   ```
4. Go to [Mapbox index file](src/bim-components/Mapbox/index.ts#L81): here is the reference to the mapbox map which will be loaded into the scene and its setup. You can keep mine for testing, or replace with yours (see [How to setup GIS data on the cloud](#setup-gis-data-on-the-cloud) for further details about map customization)
  ```js
   var myInitialState = {
            pitch: 70.16,
            bearing: 12.77,
            zoom: 16.43,
            center: center,
            style: 
            'mapbox://styles/duffra/cm5a30snz00jr01sfcudm5jd2', 
            antialias: true,
            maxZoom: 60,
            minZoom: 3,
            maxBounds: maxbounds, 
        }
   ```
5. Run the app and follow the instructions in the Terminal to open the local host on the cloud
   ```sh
   npm run dev
   ```

<!-- HOW TO -->
## How to
This section is dedicated to anyone who wants to customize the app with its own models and data. Following are basic rules that can help you to build your model, export a valid IFC and run it on a Mapbox map.
### BIM: HowTo 
The goal is to have a volumetric enclosure representing a single building. 
#### Build up your BIM model
In this project we used Autodesk Revit: you can easily use masses to get your building object. Use solids and voids to create the external skin of the building, it must result in one single component.
> [!TIP]
> 1. First rule: create a planar closed profile and use it as a key to create forms.
> 2. Second rule: define an "origin" which will be mantained as the key-point when inserting the model in the real geographic context.

It's easier to use  standard logic: e.g. the origin is the lower left vertex of the profile.
You must know the real world coordinates of this point to gain full advantage in the GIS environment. If you are lucky and are using a georeferenced starting file (like the one attached [ADG_BASE.rvt](public/support/ADG_BASE.rvt)), you can query its coordinates using the command **Report Shared Coordinates _(Manage tab/Project Location panel/Coordinates drop-down: Report Shared Coordinates)_** and take note of them. If you do not have a georeferenced model, you can however use Google Maps (or similar web services), navigate to your place and ask for coordinates right clicking on the position you chose as "origin", finally copy paste the coordinates to keep them available.

> [!IMPORTANT]
> Common advice for modelling: be sure to model the building _close_ to Revit internal origin and than move the Survey Point in the corner you chose as the building local origin.
Finally, assign materials to recognize the building: the easiest strategy is having one material for roofs and one for vertical enclosures. You can both assign a material to the solid or paint its surfaces.
#### Setup data structure
Be sure to define a solid data structure that can easily be exported in IFC, as it is the interoperability exchange format for the viewer.
In this project we opted for a list of custom parameters defining naming convention, data type and sample values for a better comprehension.
This is what Shared Parameters in Revit stand for. Every model uses the same parameters to be consistent and to standardize the IFC exporting setup.
On the one hand we have [Shared Parameters file](public/support/PRIN_Taxonomy_SharedParameters.txt), on the other the [mapping file](public/support/PRIN_IFCPsets.txt) to create a correspondance between native and IFC data.
#### Export IFC
It's important to understand what is exported, how and 'where'. Where the properties can be found and most of all where the geometry is positioned when exporting IFC. As many software have issues dealing with models far away from the the origin, we opted and recommend you to follow this rule: _export the model referred to the local origin and keep georeferencing data (if you have them) in the appropriate properties, without altering the physical position of the model.

If you use Revit, this is the setup to use: refer to the _Project Base Point oriented to True North_ and report geographic data to the IFC 4 properties.

Furthermore, you need to use a consistent setup to be sure that your data are transferred to IFC without any loss. We recommend you to map properties and build a text file to be used during the export. Below a schema to highlight the corresponding data between native parameters and IFC props.

| Native BIM  | IFC |
| ------------- | ------------- |
| Mass  | IfcBuilding |

| Parameter  | IFC Property | IFC PropertySet|
| ------------- | ------------- | ------------- |
| Residential  | Residential | 01-Building function |
| Construction age  | Construction age | 04-Age of construction |
| ...  | ... | ... |
> [!TIP]
> The extended correspondence can be found at [MappingFile](public/support/PRIN_IFCPsets.txt)
> 
> You can look at the attached export setup [IFC 4x3](public/support/ExportConfig_FD_IFC4x3.json), valid both for Geographic Reference tab and Property Sets

### IFC: HowTo 
#### From IFC to fragments and structured properties
To speed up the viewer, the current project is built on top of fragments and linked properties, based on That Open Engine approach.
You can have a look at their documentation and build your own tool to extract IFC data to a JSON file, you can use one of the existent open tools developed by the Openers Community, or you can have a look at some functions inserted in this code and experiment modifing the code by yourself commenting out this line [here](/src/classes/GeneralTools_Generate.ts#L67)
```js
/**
    * If you load a model for the first time uncomment this line below to download properties
    * These files must be copied into the public folder to have a full viewer (model+data).
    * These lines must be commented to prevent massive download whenever you launch the app
    */
    
    //exportJsonProps(model);
```

### GIS: HowTo 
So far you completed the BIM tasks :hotel:, now it's time to have a look at GIS :earth_africa:. 
In this project we used **Mapbox library**.
#### Setup GIS data on the cloud
First, create an account and save your token as you need it both to run this application and to create your own map.

You can sign up [here](https://www.mapbox.com/) and follow the instructions.

Our map is centered to Borgo Trento, Verona (Italy) and it is defined to be used with models built on top of our starting file.
```geojson
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [
              10.976953110253646,
              45.45576712736931
            ],
            [
              10.976953110253646,
              45.437771123103914
            ],
            [
              10.99793332080327,
              45.437771123103914
            ],
            [
              10.99793332080327,
              45.45576712736931
            ],
            [
              10.976953110253646,
              45.45576712736931
            ]
          ]
        ],
        "type": "Polygon"
      }
    }
  ]
}
```
In this application map is intended as a middle element of the chain: it must be readable by itself as a GIS content and must be integrated by BIM models on request.

TTo achieve this GIS-BIM exchange, every geometry on the map must be enriched by a common attribute in order to get the call for its further data and to integrate BIM project in the exact position in the GIS environment. The logic is: you ask for a specific building, the app queries the database for geometry and data (IFC side), hides the correspondent GIS geometry and inserts the BIM model in its geographical location.

To get this working, it is important to keep everything organized and to think the entire GIS-BIM project as a database, where data and geometry fly from GIS side to BIM side and reverse, whit the possibility to be layered based on specific Levels of Development (LOD).

> [!TIP]
> We opted for an ID identification approach and assigned a unique value to each building. Building ID is the key to exchange data between GIS and BIM environment.

Our Mapbox map is a mixed output built on top of:
 - Opengeodata available on Mapbox, for street classification and general data
 - Custom territorial data for representing terrain as 3D, based on real altimetry
 - Custom SAT files for buildings, integrating many attributes from regional and national databases and adding the relevant attributes for our analysis

The final output is a public map, which can be called by the code using the following style:
```js
style: 
      'mapbox://styles/duffra/cm5a30snz00jr01sfcudm5jd2',
```

_For more examples, please refer to the [Documentation](https://docs.mapbox.com/mapbox-gl-js/guides/)_

## Authors

Francesca D'Uffizi
[@duffra](https://www.linkedin.com/in/francesca-d-uffizi-52248a7a/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
