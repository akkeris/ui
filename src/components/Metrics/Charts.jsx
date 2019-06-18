import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { withTheme } from '@material-ui/core/styles';

function hourformat(date) {
  const d = new Date(date);
  if (d.getHours() === 0) {
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }).toUpperCase();
  }
  return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}
function formatterData(unit, amount) {
  if (unit === 'ms' && amount > 1000) {
    return `${(amount / 1000).toFixed(2)}s`;
  }
  if (unit === 'B' && amount > 1024 * 1024 * 1024) {
    return `${(amount / (1024 * 1024 * 1024)).toFixed(2)}GB`;
  } else if (unit === 'B' && amount > 1024 * 1024) {
    return `${(amount / (1024 * 1024)).toFixed(2)}MB`;
  } else if (unit === 'B' && amount > 1024) {
    return `${(amount / 1024).toFixed(2)}KB`;
  }
  return amount.toString() + unit;
}

const Charts = (props) => {
  let y = null;
  let z = null;
  let u = null;
  let v = null;
  let o = null;
  let w = null;
  let n = null;
  let m = null;

  if (props.legend.y != null) {
    y = <Area name={props.legend.y} unit={props.unit} type="step" dataKey="y" stroke={props.theme.palette.primary1Color} fill="url(#colorPv)" fillOpacity={1} />;
  }
  if (props.legend.z != null) {
    z = <Area name={props.legend.z} unit={props.unit} type="step" dataKey="z" stroke={props.theme.palette.primary2Color} fill="url(#colorRv)" fillOpacity={1} />;
  }
  if (props.legend.u != null) {
    u = <Area name={props.legend.u} unit={props.unit} type="step" dataKey="u" stroke={props.theme.palette.primary3Color} fill="url(#colorUv)" fillOpacity={1} />;
  }
  if (props.legend.v) {
    v = <Area name={props.legend.v} unit={props.unit} type="step" dataKey="v" stroke={props.theme.palette.accent1Color} fill="url(#colorRv)" fillOpacity={1} />;
  }
  if (props.legend.o) {
    o = <Area name={props.legend.o} unit={props.unit} type="step" dataKey="o" stroke={props.theme.palette.primary1Color} fill="url(#colorPv)" fillOpacity={1} />;
  }
  if (props.legend.w) {
    w = <Area name={props.legend.w} unit={props.unit} type="step" dataKey="w" stroke={props.theme.palette.primary2Color} fill="url(#colorUv)" fillOpacity={1} />;
  }
  if (props.legend.n) {
    n = <Area name={props.legend.n} unit={props.unit} type="step" dataKey="n" stroke={props.theme.palette.primary3Color} fill="url(#colorPv)" fillOpacity={1} />;
  }
  if (props.legend.m) {
    m = <Area name={props.legend.m} unit={props.unit} type="step" dataKey="m" stroke={props.theme.palette.accent1Color} fill="url(#colorRv)" fillOpacity={1} />;
  }

  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }}>
      <AreaChart
        width={1020}
        height={300}
        data={props.data}
        margin={{
          top: 16, right: 32, left: 32, bottom: 16,
        }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={props.theme.palette.secondary.main} stopOpacity={0.25} />
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={props.theme.palette.primary.main} stopOpacity={0.25} />
          </linearGradient>
          <linearGradient id="colorRv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={props.theme.palette.primary.dark} stopOpacity={0.25} />
          </linearGradient>
        </defs>
        <XAxis
          orientation="bottom"
          dataKey="time"
          tickSize={0}
          axisLine={false}
          tickFormatter={hourformat}
          padding={{ left: 8, right: 8 }}
          tick={{ fill: 'rgb(173,183,198)', fontSize: 11, strokeWidth: 0 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgb(173,183,198)', fontSize: 11, strokeWidth: 0 }}
          tickLine={false}
          tickSize={0}
          axisLine={false}
          tickFormatter={x => formatterData(props.unit, x)}
          padding={{ top: 8, bottom: 8 }}
        />
        <Tooltip />
        <Legend />
        <Area
          name={props.legend.x}
          type="step"
          dataKey="x"
          stroke={props.theme.palette.secondary.main}
          fill="url(#colorUv)"
          fillOpacity={1}
        />
        {y}
        {z}
        {u}
        {v}
        {w}
        {n}
        {m}
        {o}
      </AreaChart>
    </div>
  );
};

Charts.propTypes = {
  legend: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  unit: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default withTheme(Charts);
