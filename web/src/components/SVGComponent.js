import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

import GroupElement from './GroupElement';
import { DURATION } from '../services/constants';

gsap.registerPlugin(MotionPathPlugin);
gsap.registerEffect({
	name: 'trail',
	effect(targets, config) {
		const container = targets[0];

		const dot = container ? container.querySelector('.dot') : null;
		const rect = container ? container.querySelector('rect') : null;

		return gsap
			.timeline({
				defaults: { ease: 'none', duration: DURATION },
				...config,
			})
			.set(dot, { opacity: 1 })
			.to(
				dot,
				{
					motionPath: { path: container.dataset.motionPath },
					onUpdate() {
						const currentX = +gsap.getProperty(this.targets()[0], 'x');
						if (rect) {
							const rectWidth = rect.width ? rect.width.baseVal.value : 0;
							rect.x.baseVal.value = currentX - rectWidth;
						}
					},
				},
				'<'
			)
			.to(rect, { attr: { x: '100%' } }, '>');
	},
});

function animate(lines, refs) {
	const activeAnimations = new Set();
	const context = gsap.context(() => {
		const groupElements = gsap.utils.toArray('.group-elements');
		const availableElements = new Set([...groupElements]);

		function animateElement(delay = 0) {
			const randomElement = gsap.utils.random([...availableElements]);

			availableElements.delete(randomElement);

			if (randomElement) {
				return gsap.effects.trail(randomElement, {
					delay,
					onComplete() {
						// Re-add the element back to the available set
						availableElements.add(randomElement);

						// Remove the current animation from the active set
						activeAnimations.delete(this);

						// Add a new animation to the set by recursively calling 'animateElement'
						activeAnimations.add(animateElement());
					},
				});
			}
		}

		for (let i = 0; i < lines; i++) {
			activeAnimations.add(animateElement(gsap.utils.random(1, 3)));
		}
	}, refs);

	return () => {
		context.kill();
		Array.from(activeAnimations).forEach(animation => {
			if (animation) {
				animation.kill();
			}
		});
	};
}

const SVGComponent = forwardRef(
	(
		{
			id,
			width = 442,
			height = 820,
			totalLines = 19,
			totalActiveLines = 2,
			reverse,
		},
		ref
	) => {
		const [isActive, setIsActive] = useState(false);

		const svgRef = useRef(null);

		useImperativeHandle(
			ref,
			() => ({
				toggle: isActive => setIsActive(isActive),
			}),
			[]
		);

		useEffect(() => {
			if (svgRef.current) {
				svgRef.current.style.setProperty('--trail-lines-width', `${width}px`);
				svgRef.current.style.setProperty('--trail-lines-height', `${height}px`);
			}
		}, [height, width]);

		useLayoutEffect(() => {
			const cleanUp = animate(totalActiveLines, [svgRef]);
			return () => {
				cleanUp();
			};
		}, [svgRef, isActive, totalActiveLines]);

		return (
			<svg
				ref={svgRef}
				className="TrailLines pointer-events-none"
				viewBox={`0 0 ${width} ${height}`}
				width={width}
				height={height}
				preserveAspectRatio="xMaxYMid slice"
				style={{
					maskSize:
						'var(--trail-lines-width, auto) var(--trail-lines-height, auto)',
					maskPosition: 'top right',
					maskImage:
						'linear-gradient(-90deg, rgba(0, 0, 0, 1) 80%, transparent)',
					WebkitMaskSize:
						'var(--trail-lines-width, auto) var(--trail-lines-height, auto)',
					WebkitMaskPosition: 'top right',
					WebkitMaskImage:
						'linear-gradient(-90deg, rgba(0, 0, 0, 1) 80%, transparent)',
					transform: reverse ? 'scaleX(-1)' : 'none',
				}}
			>
				<defs>
					<linearGradient id={`${id}-lgradient-base-lines`}>
						<stop offset="0" stopColor="#d530e0" stopOpacity="0"></stop>
						<stop offset="1" stopColor="#d530e0"></stop>
					</linearGradient>
					<linearGradient id={`${id}-lgradient-01`}>
						<stop
							offset="0.0"
							stopColor="rgba(255, 117, 134, 1)"
							stopOpacity="0"
						></stop>
						<stop offset="0.5" stopColor="rgba(255, 117, 134, 1)"></stop>
						<stop offset="1.0" stopColor="rgba(0, 217, 255, 1)"></stop>
					</linearGradient>
					<linearGradient id={`${id}-lgradient-02`}>
						<stop
							offset="0.0"
							stopColor="rgba(255, 220, 0, 1)"
							stopOpacity="0"
						></stop>
						<stop offset="0.5" stopColor="rgba(255, 220, 0, 1)"></stop>
						<stop offset="1.0" stopColor="rgba(0, 255, 215, 1)"></stop>
					</linearGradient>
					<linearGradient id={`${id}-lgradient-03`}>
						<stop
							offset="0.0"
							stopColor="rgba(0, 248, 255, 1)"
							stopOpacity="0"
						></stop>
						<stop offset="0.5" stopColor="rgba(0, 248, 255, 1)"></stop>
						<stop offset="1.0" stopColor="rgba(249, 253, 83, 1)"></stop>
					</linearGradient>
					<linearGradient id={`${id}-lgradient-04`}>
						<stop
							offset="0.0"
							stopColor="rgba(255, 0, 31, 1)"
							stopOpacity="0"
						></stop>
						<stop offset="0.5" stopColor="rgba(255, 0, 31, 1)"></stop>
						<stop offset="1.0" stopColor="rgba(96, 255, 236, 1)"></stop>
					</linearGradient>
					<linearGradient id={`${id}-lgradient-base-lines`}>
						<stop offset="0" stopColor="rgba(255, 233, 157, .2)"></stop>
						<stop
							offset="1"
							stopColor="rgba(255, 233, 157, 0)"
							stopOpacity="0"
						></stop>
					</linearGradient>
					<linearGradient id={`${id}-lgradient-base-lines`}>
						<stop offset="0" stopColor="rgba(173, 68, 255, .96)"></stop>
						<stop
							offset="1"
							stopColor="rgba(173, 68, 255, 0)"
							stopOpacity="0"
						></stop>
					</linearGradient>
				</defs>
				{isActive && (
					<GroupElement
						id={id}
						width={width}
						height={height}
						totalLines={totalLines}
					/>
				)}
			</svg>
		);
	}
);

SVGComponent.displayName = 'TrailLines';

export default SVGComponent;
