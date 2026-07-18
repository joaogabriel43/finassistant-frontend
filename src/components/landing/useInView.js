import { useEffect, useRef, useState } from 'react';

/**
 * Hook de scroll-reveal da landing (Lote K): marca o elemento como visível
 * quando entra no viewport — zero dependências, IntersectionObserver nativo.
 * Em ambientes sem IO (jsdom/testes), começa visível (nunca esconde conteúdo).
 */
export default function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [visivel, setVisivel] = useState(typeof IntersectionObserver === 'undefined');

    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined' || !ref.current) {
            setVisivel(true);
            return undefined;
        }
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisivel(true); },
            { threshold }
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, visivel];
}
