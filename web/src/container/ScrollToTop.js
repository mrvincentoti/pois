import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop({ children }) {
	const [current, setCurrent] = useState(null);

	const location = useLocation();

	useEffect(() => {
		if (location.pathname !== current) {
			setCurrent(location.pathname);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}, [current, location]);

	return <>{children}</>;
}

export default ScrollToTop;
