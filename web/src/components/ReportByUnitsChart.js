import React from 'react';
import Chart from 'react-apexcharts';

const ReportByUnitsChart = ({ poi_activities_by_type }) => {
	const options = {
		series: [
			{
				name: 'Total',
				data: poi_activities_by_type.series,
			},
		],
		annotations: {
			points: [
				{
					x: 'Bananas',
					seriesIndex: 0,
					label: {
						borderColor: '#775DD0',
						offsetY: 0,
						style: {
							color: '#fff',
							background: '#775DD0',
						},
						text: '',
					},
				},
			],
		},
		chart: {
			height: 350,
			type: 'bar',
		},
		plotOptions: {
			bar: {
				borderRadius: 10,
				columnWidth: '50%',
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			width: 0,
		},
		grid: {
			row: {
				colors: ['#fff', '#f2f2f2'],
			},
		},
		xaxis: {
			labels: {
				rotate: -45,
			},
			categories: poi_activities_by_type.categories,
			tickPlacement: 'on',
		},
		yaxis: {
			title: {
				text: 'Total',
			},
		},
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'light',
				type: 'horizontal',
				shadeIntensity: 0.25,
				gradientToColors: undefined,
				inverseColors: true,
				opacityFrom: 0.85,
				opacityTo: 0.85,
				stops: [50, 0, 100],
			},
		},
	};

	return (
		<div id="chart">
			<Chart
				options={options}
				series={options.series}
				type="bar"
				height={520}
			/>
		</div>
	);
};

export default ReportByUnitsChart;
