import { useCallback, useRef } from 'react';

export function useDragScroll() {
    const cleanupsRef = useRef<(() => void) | null>(null);

    const refCallback = useCallback((el: HTMLDivElement | null) => {
        // Run cleanup of previous element if it exists
        if (cleanupsRef.current) {
            cleanupsRef.current();
            cleanupsRef.current = null;
        }

        if (!el) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;
        let dragDistance = 0;

        const handleMouseDown = (e: MouseEvent) => {
            // Only trigger dragging with the left-click button
            if (e.button !== 0) return;
            
            // Ignore click/drag start on interactive elements
            const target = e.target as HTMLElement;
            if (target.closest('button, a, input, select, textarea, label')) return;

            isDown = true;
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
            dragDistance = 0;
            el.style.userSelect = 'none'; // Prevent text highlight while dragging
        };

        const handleMouseLeave = () => {
            if (isDown) {
                isDown = false;
                el.style.cursor = 'grab';
                el.style.userSelect = '';
            }
        };

        const handleMouseUp = () => {
            if (isDown) {
                isDown = false;
                el.style.cursor = 'grab';
                el.style.userSelect = '';
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5; // Drag speed multiplier
            dragDistance = Math.abs(x - startX);

            if (dragDistance > 5) {
                e.preventDefault(); // Prevent text selection/dragging default behavior
                el.scrollLeft = scrollLeft - walk;
                el.style.cursor = 'grabbing';
            }
        };

        const handleCaptureClick = (e: MouseEvent) => {
            if (dragDistance > 5) {
                e.stopPropagation();
                e.preventDefault();
            }
        };

        el.addEventListener('mousedown', handleMouseDown);
        el.addEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseup', handleMouseUp);
        el.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('click', handleCaptureClick, true); // Capture phase listener

        // Initial cursor style
        el.style.cursor = 'grab';

        cleanupsRef.current = () => {
            el.removeEventListener('mousedown', handleMouseDown);
            el.removeEventListener('mouseleave', handleMouseLeave);
            el.removeEventListener('mouseup', handleMouseUp);
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('click', handleCaptureClick, true);
            el.style.cursor = '';
            el.style.userSelect = '';
        };
    }, []);

    return refCallback;
}
