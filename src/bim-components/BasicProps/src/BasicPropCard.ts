import * as OBC from 'openbim-components';

/**
 * Custom window to show model data (OBC based)
 * Visualizzazione del contenuto informativo con OBC
 * 
 * 
 */
export class BasicPropCard extends OBC.SimpleUIComponent {
    set propLabel(value: string){
        const propLabelElement=this.getInnerElement("propLabel") as HTMLParagraphElement
        propLabelElement.textContent=value
    }

    set propValue(value: string){
        const propValueElement=this.getInnerElement("propValue") as HTMLParagraphElement
        propValueElement.textContent=value
    }

    constructor(components: OBC.Components){
        const template = `
            <div style="display: flex;
            flex-direction: row;
            justify-content: space-between;
            height: 500px
            ">
                <div id="propLabel"> myLabel </div>
                <div id="propValue"> myValue </div>
            </div>
        `
        super(components, template)
    }
}