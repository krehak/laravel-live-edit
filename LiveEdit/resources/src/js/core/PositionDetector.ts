import LiveElement from './LiveElement';

const px = (number: number|string): string => {
    return `${number}px`;
}

class PositionDetector {
    private static $classPrefix: string = 'live-edit__';

    public static findPosition(target: LiveElement, editor: LiveElement) {
        editor.clearInlineStyles();
        editor.removeClass(`${this.$classPrefix}position-bottom`);
        editor.removeClass(`${this.$classPrefix}position-top`);
        editor.removeClass(`${this.$classPrefix}position-left`);
        editor.removeClass(`${this.$classPrefix}position-right`);
        editor.removeClass(`${this.$classPrefix}position-center`);

        let verticalPositionFound = this.bottomPossitionPossible(target, editor);
        let horizontalPositionFound = false;

        if(!verticalPositionFound) verticalPositionFound = this.topPossitionPossible(target, editor);

        if(verticalPositionFound) {
            horizontalPositionFound = this.leftPossitionPossible(target, editor);

            if(!horizontalPositionFound) horizontalPositionFound = this.rightPossitionPossible(target, editor);
        }

        if(!verticalPositionFound || !horizontalPositionFound) {
            editor.addClass(`${this.$classPrefix}position-center`);
        }
    }

    public static bottomPossitionPossible(target: LiveElement, editor: LiveElement): boolean {
        let {
            top, targetHeight, editorHeight, viewportEnd
        } = this.getPositionData(target, editor);

        let editorTop = top + targetHeight;
        let editorVisibleEnd = editorTop + editorHeight;

        if(editorVisibleEnd < viewportEnd) {
            editor.setStyle('top', px(editorTop));
            editor.addClass(`${this.$classPrefix}position-bottom`);
            return true;
        }

        return false;
    }

    public static topPossitionPossible(target: LiveElement, editor: LiveElement): boolean {
        let {
            top, editorHeight, viewportStart
        } = this.getPositionData(target, editor);

        let editorTop = top - editorHeight;

        if(editorTop > viewportStart) {
            editor.setStyle('top', px(editorTop - 15)); // 15px arrow offset
            editor.addClass(`${this.$classPrefix}position-top`);
            return true;
        }

        return false;
    }

    public static leftPossitionPossible(target: LiveElement, editor: LiveElement): boolean {
        let {
            left, editorWidth, viewportXEnd
        } = this.getPositionData(target, editor);

        let editorLeft = left;
        let editorVisibleEnd = editorLeft + editorWidth;

        if(editorVisibleEnd < viewportXEnd) {
            editor.setStyle('left', px(editorLeft));
            editor.addClass(`${this.$classPrefix}position-left`);
            return true;
        }

        return false;
    }

    public static rightPossitionPossible(target: LiveElement, editor: LiveElement): boolean {
        let {
            left, targetWidth, editorWidth, viewportXStart
        } = this.getPositionData(target, editor);

        let editorLeft = (left + targetWidth) - editorWidth;

        if(editorLeft > viewportXStart) {
            editor.setStyle('left', px(editorLeft));
            editor.addClass(`${this.$classPrefix}position-right`);
            return true;
        }

        return false;
    }

    public static getPositionData(target: LiveElement, editor: LiveElement) {
        let bounds = target.getBoundingClientRect();
        let boundsEditor = editor.getBoundingClientRect();
        let scrolledLeft = window.scrollX;
        let scrolledTop = window.scrollY;
        let left = scrolledLeft + bounds.x;
        let top = scrolledTop + bounds.y;
        let targetWidth = bounds.width;
        let targetHeight = bounds.height;
        let editorWidth = boundsEditor.width;
        let editorHeight = boundsEditor.height;
        let viewportStart = scrolledTop;
        let viewportEnd = window.innerHeight + viewportStart;
        let viewportXStart = scrolledLeft;
        let viewportXEnd = window.innerWidth + viewportXStart;

        return {
            scrolledLeft, scrolledTop, left, top,
            targetWidth, targetHeight, editorWidth, editorHeight,
            viewportStart, viewportEnd, viewportXStart, viewportXEnd
        };
    }
}

export default PositionDetector;
