import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // If there's a hash, let the browser handle it or handle it manually if needed
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // If no hash, scroll to top
            window.scrollTo(0, 0);
        }
    }, [pathname, hash]);

    return null;
}
