import React, {useState} from 'react';
import { Button, Table, DatePicker} from 'antd';
import 'antd/dist/antd.css';
import {useQuery} from "@tanstack/react-query";


const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
  },
  {
    title: 'Description',
    dataIndex: 'description',
  },
];

function toObjectMap(list, key){
    const pairs = list.map(item => [item[key], item]);
    return Object.fromEntries(pairs);
}

const App = () => {
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filtered, setFiltered] = useState(false);
  const [objectMapEvents, setObjectMapEvents] = useState(null);
  const { error, data: historicalEvents, refetch: loadData, isFetching } = useQuery(['data'], () =>
      fetch( `/elastic.io/data-history.json`).then(res => res.json())
  ,{
          refetchOnWindowFocus: false,
          enabled: false,
          onSuccess: (data) => setObjectMapEvents(toObjectMap(data?.data, 'date'))
      }
  )

  const onLoadData = async () => {
     await loadData();
  }

  const onDateChange = (_, dateString) => {
      if (dateString) {
          setFilteredEvents([objectMapEvents[dateString]])
          setFiltered(true);
      } else {
          setFilteredEvents([]);
          setFiltered(false);
      }
  };

  if (error) return 'An error has occurred: ' + error.message;

    return (
      <div>
        <div
            style={{
              margin: 16,
            }}
        >
          <Button type="primary" loading={isFetching} onClick={onLoadData} disabled={filtered}>
              Load Historical Events
          </Button>
          <DatePicker onChange={onDateChange} format="YYYY/MM/DD" disabled={!historicalEvents?.data?.length}/>
        </div>
        <Table
            loading={isFetching}
            columns={columns}
            rowKey="description"
            dataSource={filtered ? filteredEvents : historicalEvents?.data}
        />
      </div>
  );
};

export default App;
