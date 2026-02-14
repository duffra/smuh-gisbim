import * as OBC from "openbim-components"
import { BasicPropCard } from "./src/BasicPropCard"

interface BasicProp{
    propLabel: string
    propValue: string
}

/**
 * Custom components for property table
 * using OBC
 * Implementazione custom di componenti per la visualizzazione delle proprietà
 * 
 */
export class BasicProps extends OBC.Component<BasicProp[]> implements OBC.UI{
    static uuid="47633b9b-4496-488e-91e5-d173fb9d32b2"
    enabled: boolean=true;
    uiElement= new OBC.UIElement<{
        propList: OBC.FloatingWindow
    }>();

    private _components:OBC.Components
    private _list: BasicProp[]=[]

    constructor(components: OBC.Components){
        super(components);
        this._components=components
        components.tools.add(BasicProps.uuid,this)
        this.setUI()
    }
   

    get(): BasicProp[] {
        return this._list
    }

    private setUI() {
        const propsWin=new OBC.FloatingWindow(this._components)
        this._components.ui.add(propsWin)
        propsWin.visible=true
        propsWin.title="Data"
        this.uiElement.set({propList:propsWin})
    }

    addBasicProp(label: string, value: string){
        const basicProp: BasicProp ={
            propLabel:label,
            propValue:value
        }
        const basicProCard=new BasicPropCard(this._components)
        basicProCard.propLabel=basicProp.propLabel
        basicProCard.propValue=basicProp.propValue
        const basicPropList=this.uiElement.get("propList")
        basicPropList.addChild(basicProCard)
    }
}