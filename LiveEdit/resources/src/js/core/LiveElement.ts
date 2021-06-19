class LiveElement {
    private readonly element: Element;

    public constructor(element: Element) {
        this.element = element;
    }

    public getStyle(styleName: string): string {
        let defaultView = (this.element.ownerDocument || document).defaultView;

        return defaultView.getComputedStyle(this.element, null).getPropertyValue(styleName);
    }

    public setStyle(styleName: string, styleValue: string|null, important?: boolean): void {
        this.element['style'].setProperty(styleName, styleValue, important ? 'important' : null);
    }

    public clearInlineStyles(): void {
        this.element['style'] = '';
    }

    public getAttribute(attributeName: string): string|null {
        return this.element.getAttribute(attributeName);
    }

    public on(eventName: string, callback: Function, options?: boolean|AddEventListenerOptions): LiveElement {
        this.element.addEventListener(eventName, (e: Event) => {
            callback(e);
        }, options);

        return this;
    }

    public once(eventName: string, callback: Function): LiveElement {
        return this.on(eventName, callback, {
            once: true
        });
    }

    public getText(): string {
        return this.element.textContent;
    }

    public setText(textContent: string): void {
        this.element.textContent = textContent;
    }

    public getKey(): string {
        return this.element.getAttribute('data-live-edit');
    }

    public addClass(...classList: string[]): void {
        this.element.classList.add(...classList);
    }

    public removeClass(...classList: string[]): void {
        this.element.classList.remove(...classList);
    }

    public toggleClass(className: string, force?: boolean): boolean {
        return this.element.classList.toggle(className, force);
    }

    public hasClass(className: string): boolean {
        return this.element.classList.contains(className);
    }

    public getBoundingClientRect(): DOMRect {
        return this.element.getBoundingClientRect();
    }
}

export default LiveElement;
