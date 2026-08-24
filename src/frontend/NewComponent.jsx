import React from 'react';
import HolidayCalendar from './components/HolidayCalendar';

// Entry point wired up by hyperdart.config.js (via src/frontend/index.jsx).
// HyperDart injects `searchData` and `messageHandlers` as props here.
function NewComponent(props) {
  return <HolidayCalendar searchData={props.searchData} messageHandlers={props.messageHandlers} />;
}

export default NewComponent;
