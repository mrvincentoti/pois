import React from 'react';
import Chart from 'react-apexcharts';

const PoiStatisticsChart = () => {
	const options = {
		chart: {
			width: 380,
			type: 'pie',
		},
		labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
		responsive: [
			{
				breakpoint: 480,
				options: {
					chart: {
						width: 200,
					},
					legend: {
						position: 'bottom',
					},
				},
			},
		],
	};

	const series = [44, 55, 13, 43, 22]; // Data for the pie chart

	return (
		<div>
			<div id="chart">
				<Chart options={options} series={series} type="pie" width={380} />
			</div>
			<div id="html-dist"></div>
		</div>
	);
};

export default PoiStatisticsChart;
