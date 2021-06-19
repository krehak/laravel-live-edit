import LiveElement from './LiveElement';
import PositionDetector from './PositionDetector';
import Request from './Request';

interface ElementWithOffset extends Element {
    readonly offsetLeft: number;
    readonly offsetTop: number;
}

interface TextElement extends Element {
    innerText: string;
}

interface SuccessResponse {
    readonly success: boolean;
}

class Editor {
    private element: ElementWithOffset;
    private liveElement: LiveElement;
    private elementHandler: Element;
    private textarea: HTMLTextAreaElement;
    private buttonCancel: TextElement;
    private buttonSave: TextElement;
    private activeTarget: LiveElement;
    private isVisible: boolean = false;
    private isLoading: boolean = false;
    private originalText: string;
    private $classPrefix: string = 'live-edit__';
    // @ts-ignore
    private debounce: NodeJS.Timeout;
    private saveUrl: string = './live-edit/update';
    private isDragged: boolean = false;
    private dragPositionX: number;
    private dragPositionY: number;

    public constructor() {
        this.generateElement();

        window.addEventListener('scroll', () => this.recalculatePosition());
        window.addEventListener('touchmove', () => this.recalculatePosition());
    }

    public open(target: LiveElement) {
        this.openEditable(target);
        this.recalculatePosition();
    }

    private recalculatePosition() {
        if(this.activeTarget && this.isVisible && !this.isDragged) {
            PositionDetector.findPosition(this.activeTarget, this.liveElement);
        }
    }

    private openModel() {
        this.element.classList.add(`${this.$classPrefix}modal-is-visible`);
        this.element.classList.remove(`${this.$classPrefix}position-dragged`);
        this.isVisible = true;
        this.isDragged = false;
    }

    private closeModel() {
        this.element.classList.remove(`${this.$classPrefix}modal-is-visible`);
        this.isVisible = false;
    }

    private generateElement() {
        this.element = document.createElement('div');
        this.element.className = `${this.$classPrefix}modal`;
        this.liveElement = new LiveElement(this.element);

        let wrapper = document.createElement('div');
        wrapper.className = `${this.$classPrefix}modal-wrapper`;
        this.element.appendChild(wrapper);

        this.elementHandler = document.createElement('div');
        this.elementHandler.className = `${this.$classPrefix}modal-handler`;
        wrapper.appendChild(this.elementHandler);

        this.textarea = document.createElement('textarea');
        this.textarea.className = `${this.$classPrefix}modal-textarea`;
        wrapper.appendChild(this.textarea);

        let controls = document.createElement('div');
        controls.className = `${this.$classPrefix}modal-controls`;
        wrapper.appendChild(controls);

        this.buttonCancel = document.createElement('div');
        this.buttonCancel.className = `${this.$classPrefix}modal-button-cancel`;
        this.buttonCancel.innerText = 'cancel';
        controls.appendChild(this.buttonCancel);

        this.buttonSave = document.createElement('div');
        this.buttonSave.className = `${this.$classPrefix}modal-button-save`;
        this.buttonSave.innerText = 'SAVE';
        controls.appendChild(this.buttonSave);

        document.body.appendChild(this.element);

        this.attachEvents();
    }

    private attachEvents() {
        this.buttonCancel.addEventListener('click', () => this.onCancel());
        this.buttonSave.addEventListener('click', () => this.onSave());
        this.textarea.addEventListener('keyup', () => this.onKeyUp());
        this.elementHandler.addEventListener('mousedown', (e: any) => this.dragEditor(e));
    }

    private onCancel() {
        if(this.getText() === this.originalText) {
            return this.doCancel();
        }

        let confirmed = confirm('Discard changes?');

        if(confirmed) {
            return this.doCancel();
        }
    }

    private doCancel() {
        this.setTargetOldText();
        this.closeModel();
    }

    private onSave() {
        this.saveToServer().then((data: SuccessResponse) => {
            if(data.success) {
                this.setTargetNewText();
                this.closeModel();
            } else {
                Editor.showError('Invalid server request.');
            }
        }).catch((err) => {
            console.error(err);
            Editor.showError('Error occurred. See console for more details.');
        });
    }

    private static showError(message: string = 'Unexpected error occurred.') {
        alert(`LiveEdit: ${message}`);
    }

    private setTargetOldText() {
        this.activeTarget.setText(this.originalText);
    }

    private setTargetNewText() {
        this.activeTarget.setText(this.getText());
    }

    private onKeyUp() {
        if(this.debounce) clearTimeout(this.debounce);

        this.debounce = setTimeout(() => {
            this.setTargetNewText();
        }, 150);
    }

    private setText(textContent: string) {
        this.originalText = textContent;
        this.textarea.value = this.originalText;
    }

    private getText(): string {
        return this.textarea.value;
    }

    private openEditable(target: LiveElement) {
        this.activeTarget = target;
        this.setText(this.activeTarget.getText());
        this.openModel();
    }

    private setLoading(state: boolean) {
        this.isLoading = state;

        this.buttonSave.classList[state ? 'add' : 'remove'](`${this.$classPrefix}modal-button-save-is-loading`);
    }

    private saveToServer() {
        let url = typeof window['live_edit_update_url'] === 'string' ? window['live_edit_update_url'] : this.saveUrl;

        if(this.isLoading) return;

        let request = new Request();
        this.setLoading(true);

        return new Promise((resolve, reject) => {
            request.post(url, {
                request_type: 'live-edit-request',
                key: this.activeTarget.getKey(),
                content: this.getText()
            }).then((response: XMLHttpRequest) => {
                if(response.status == 200) {
                    resolve(JSON.parse(response.responseText));
                } else {
                    reject(response.response);
                }

                this.setLoading(false);
            }).catch((response) => {
                reject(response);

                this.setLoading(false);
            });
        });
    }

    private dragEditor(e: any) {
        if(!e) {
            e = window.event;
        }

        e.preventDefault();

        this.dragPositionX = e.clientX;
        this.dragPositionY = e.clientY;

        const dragMoveFunction = (e: any) => this.startDragging(e);
        const dragRemoveEventFunction = () => {
            document.removeEventListener('mousemove', dragMoveFunction);
            document.removeEventListener('mouseup', dragRemoveEventFunction);
            this.element.classList.remove(`${this.$classPrefix}position-dragging`);
        };

        document.addEventListener('mousemove', dragMoveFunction);
        document.addEventListener('mouseup', dragRemoveEventFunction);
    }

    private startDragging(e: any) {
        if(!e) {
            e = window.event;
        }

        e.preventDefault();

        let x = this.dragPositionX - e.clientX;
        let y = this.dragPositionY - e.clientY;
        this.dragPositionX = e.clientX;
        this.dragPositionY = e.clientY;

        this.liveElement.setStyle('left', `${this.element.offsetLeft - x}px`);
        this.liveElement.setStyle('top', `${this.element.offsetTop - y}px`);

        this.element.classList.add(`${this.$classPrefix}position-dragging`);

        if(!this.isDragged) {
            this.isDragged = true;
            this.element.classList.add(`${this.$classPrefix}position-dragged`);
        }
    }
}

export default Editor;
