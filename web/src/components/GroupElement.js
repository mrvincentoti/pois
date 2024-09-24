import React from 'react';
import gsap from 'gsap';

import {
	COMPACT_VERTICAL_SPACE,
	GRADIENT_SUFFIXES,
	LINE_WIDTH,
	TRIAL_SIZE_PERCENTAGE,
} from '../services/constants';

const getRandomGradientSuffix = gsap.utils.random;

const GroupElement = ({ id, width, height, totalLines }) => {
	const halfWidth = width / 2;
	const controlWidth = width - width / 3;
	const spacingBetweenLines = height / (totalLines - 1);
	const verticalCompression = COMPACT_VERTICAL_SPACE / 100;
	const halfHeight = Math.round(height / 2);

	const formatPath = path =>
		path
			.split(/\n/)
			.map(line => line.trim())
			.join(' ')
			.trim();

	return (
		<>
			{Array.from({ length: totalLines }, (_, index) => {
				// Calculate positions for each line
				const yPosition = spacingBetweenLines * index;
				const controlYPosition = Math.round(
					(yPosition - halfHeight) * verticalCompression + halfHeight
				);

				// Construct the motion path and secondary path
				const motionPath = formatPath(`
					M 0 ${yPosition}
					C ${halfWidth} ${yPosition}
					${controlWidth} ${controlYPosition}
					${width + 20} ${controlYPosition}
				`);

				const secondaryPath = formatPath(`
					v ${LINE_WIDTH}
					C ${controlWidth} ${controlYPosition + LINE_WIDTH}
					${halfWidth} ${yPosition + LINE_WIDTH}
					0 ${yPosition + LINE_WIDTH}
				`);

				return (
					<g
						key={`group-${id}-${index}`}
						className="group-elements"
						data-motion-path={motionPath}
					>
						{/* Line path */}
						<path
							d={`${motionPath} ${secondaryPath}`}
							fill={`url(#${id}-lgradient-base-lines)`}
						/>

						{/* Clip path for the gradient rect */}
						<clipPath id={`${id}-clip-path-${index}`}>
							<path d={`${motionPath} ${secondaryPath}`} />
						</clipPath>

						{/* Gradient rectangle for the line */}
						<rect
							id={`${id}-rect-${index}`}
							width={TRIAL_SIZE_PERCENTAGE}
							height="100%"
							fill={`url(#${id}-lgradient-${getRandomGradientSuffix(GRADIENT_SUFFIXES)})`}
							clipPath={`url(#${id}-clip-path-${index})`}
							x={`-${TRIAL_SIZE_PERCENTAGE}`}
						/>

						{/* Dots or circles associated with each line */}
						<g
							id={`${id}-circles-${index}`}
							className="dot"
							style={{ opacity: 0 }}
						>
							<circle
								r={LINE_WIDTH * 20}
								fill={`url(#${id}-rgradient-dot-back)`}
							/>
							<circle
								r={LINE_WIDTH * 10}
								fill={`url(#${id}-rgradient-dot-front)`}
							/>
							<circle r={LINE_WIDTH * 1.5} fill="white" />
						</g>
					</g>
				);
			})}
		</>
	);
};

export default GroupElement;
