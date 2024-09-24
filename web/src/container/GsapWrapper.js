import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import SVGComponent from '../components/SVGComponent';

const CustomSVGComponent = memo(SVGComponent);

const GsapWrapper = ({ children }) => {
	const [dimensions, setDimensions] = useState();

	const startRef = useRef(null);
	const endRef = useRef(null);
	const containerRef = useRef(null);

	const adjustDimensions = useCallback(() => {
		if (startRef.current) {
			startRef.current.toggle(false);
		}
		if (endRef.current) {
			endRef.current.toggle(false);
		}

		const containerWidth = containerRef.current?.clientWidth || 0;
		const containerHeight = containerRef.current?.clientHeight || 0;

		if (!containerWidth || !containerHeight || containerWidth < 500) {
			return;
		}

		setDimensions({
			width: containerWidth / 2,
			height: containerHeight,
		});
	}, []);

	useEffect(() => {
		if (startRef.current) {
			startRef.current.toggle(true);
		}
		if (endRef.current) {
			endRef.current.toggle(true);
		}
	}, [dimensions]);

	useEffect(() => {
		adjustDimensions();
		window.addEventListener('resize', adjustDimensions);

		return () => {
			window.removeEventListener('resize', adjustDimensions);
		};
	}, [adjustDimensions]);

	return (
		<div
			ref={containerRef}
			className="position-relative z-0 mx-auto d-flex w-100 align-items-center justify-content-center overflow-hidden"
		>
			<div className="d-flex align-items-center">
				{dimensions && (
					<CustomSVGComponent
						id="start"
						ref={startRef}
						width={dimensions.width}
						height={dimensions.height}
					/>
				)}
			</div>
			{children}
			<div className="d-flex align-items-center">
				{dimensions && (
					<CustomSVGComponent
						id="end"
						ref={endRef}
						width={dimensions.width}
						height={dimensions.height}
						reverse={true}
					/>
				)}
			</div>
		</div>
	);
};

export default GsapWrapper;
