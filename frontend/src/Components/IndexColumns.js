import React from 'react';

export default [
    {
      label: 'Name',
      dataKey: 'name',
      cellDataGetter: ({ rowData }) => rowData,
      cellRenderer: ({ rowData }) => <a href={`/tags/${rowData.key}`}>{rowData.key}</a>
    },
    {
      label: 'Value',
      dataKey: 'value',
      cellDataGetter: ({ rowData }) => rowData,
      cellRenderer: ({ rowData }) => <a href={`/tags/${rowData.key}/${rowData.value}`}>{rowData.value}</a>
    },
    { label: 'Count', dataKey: 'count' },
    {
      label: 'Hourly',
      dataKey: 'hourly',
      cellRenderer: ({ rowData }) => `$${rowData.hourly.toFixed(2)}`
    },
    {
      label: 'Cost',
      dataKey: 'cost',
      cellRenderer: ({ rowData }) => `$${rowData.cost.toFixed(2)}`
    },
  ];
