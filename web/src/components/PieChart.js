import React, {useEffect, useState} from 'react';
import Chart from 'react-apexcharts';

const PieChart = ({ statistics, categories, title, size }) => {
  const [data, setData] = useState([]);
  const [category, setCategory] = useState([]);
  const [sizee, setSizee] = useState([]);
  useEffect(() => {

    setData(statistics)
    setCategory(categories)
    setSizee(size)
  }, []);


  const options = {
    chart: {
      type: 'pie',
    },
    labels: categories,
  };



  return (
    <div className="pie-chart">
      <Chart options={options} series={data} type="pie" width={sizee} />
    </div>
  );
};

export default PieChart;

