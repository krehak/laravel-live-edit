import Editor from './core/Editor';
import LiveElement from './core/LiveElement';

const liveEditInit = () => {
    let liveEditElements = document.querySelectorAll('[data-live-edit]');
    let editor = new Editor();

    for(let i = 0; i < liveEditElements.length; i++) {
        let element = new LiveElement(liveEditElements[i]);

        if(element.getStyle('position') === 'static') {
            element.setStyle('position', 'relative', true);
        }
        if(element.getStyle('display') === 'inline') {
            element.setStyle('display', 'inline-block', true);
        }

        element.on('click', (e: Event) => {
            e.preventDefault();
            e.stopPropagation();

            editor.open(element);
        });
    }
};

window.onload = liveEditInit;
