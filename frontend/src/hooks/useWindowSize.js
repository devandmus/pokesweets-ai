import { useState, useEffect } from 'react';

/**
 * Custom hook to get window dimensions with throttled resize listener
 * Optimized to reduce re-renders and improve performance
 */
export function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        let timeoutId = null;

        const handleResize = () => {
            // Clear previous timeout
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // Throttle resize events to max once every 250ms
            timeoutId = setTimeout(() => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            }, 250);
        };

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    return windowSize;
}

