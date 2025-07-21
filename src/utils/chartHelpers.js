import * as d3 from 'd3';

export const createLineChart = (data, svgElement) => {
  const svg = d3.select(svgElement);
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = +svg.attr('width') - margin.left - margin.right;
  const height = +svg.attr('height') - margin.top - margin.bottom;

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => new Date(d.dateTime)))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3.line()
    .x(d => x(new Date(d.dateTime)))
    .y(d => y(d.value));

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5));

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5)
    .attr('d', line);
};

export const createBarChart = (data, svgElement) => {
  const svg = d3.select(svgElement);
  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = +svg.attr('width') - margin.left - margin.right;
  const height = +svg.attr('height') - margin.top - margin.bottom;

  const x = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([height - margin.bottom, margin.top]);

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.label))
    .attr('y', d => y(d.value))
    .attr('height', d => y(0) - y(d.value))
    .attr('width', x.bandwidth());
};

export const createPieChart = (data, svgElement) => {
  const svg = d3.select(svgElement);
  const width = +svg.attr('width');
  const height = +svg.attr('height');
  const radius = Math.min(width, height) / 2;

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const pie = d3.pie()
    .value(d => d.value);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 10);

  const g = svg.append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  const path = g.selectAll('path')
    .data(pie(data))
    .enter().append('path')
    .attr('fill', d => color(d.data.label))
    .attr('d', arc);
};