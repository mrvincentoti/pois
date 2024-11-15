import React from 'react';
import Chart from 'react-apexcharts';

const PoiStatisticsChart = ({ poi_category_statistics }) => {
	const options = {
		chart: {
			width: 380,
			type: 'pie',
		},
		labels: poi_category_statistics.categories,
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

	const series = poi_category_statistics.series;

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
