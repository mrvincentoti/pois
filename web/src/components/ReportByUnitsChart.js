import React from 'react';
import Chart from 'react-apexcharts';

const ReportByUnitsChart = () => {
	const options = {
		chart: {
			type: 'bar',
			height: 350,
			stacked: true,
		},
		plotOptions: {
			bar: {
				horizontal: true,
				dataLabels: {
					total: {
						enabled: true,
						offsetX: 0,
						style: {
							fontSize: '13px',
							fontWeight: 900,
						},
					},
				},
			},
		},
		stroke: {
			width: 1,
			colors: ['#fff'],
		},
		title: {
			text: '',
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
			labels: {
				formatter: function (val) {
					return val + 'K';
				},
			},
		},
		yaxis: {
			title: {
				text: undefined,
			},
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return val + 'K';
				},
			},
		},
		fill: {
			opacity: 1,
		},
		legend: {
			position: 'top',
			horizontalAlign: 'left',
			offsetX: 40,
		},
	};

	const series = [
		{
			name: 'Unit 1',
			data: [44, 55, 41, 37, 22, 43, 21],
		},
		{
			name: 'Unit 2',
			data: [53, 32, 33, 52, 13, 43, 32],
		},
		{
			name: 'Unit 3',
			data: [12, 17, 11, 9, 15, 11, 20],
		},
		{
			name: 'Unit 4',
			data: [9, 7, 5, 8, 6, 9, 4],
		},
		{
			name: 'Unit 5',
			data: [25, 12, 19, 32, 25, 24, 10],
		},
	];

	return (
		<div>
			<Chart options={options} series={series} type="bar" height={500} />
		</div>
	);
};

export default ReportByUnitsChart;
