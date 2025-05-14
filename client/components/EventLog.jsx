import { ArrowUp, ArrowDown } from "react-feather";
import { useState } from "react";

function Event({ event, timestamp }) {
  if (!event) {
    return;
  }

  // Format timestamp
  const date = new Date(timestamp);
  const formattedTime = date.toLocaleTimeString();

  // Create JSON view
  const formattedJson = JSON.stringify(event, null, 2);
  
  return (
    <div className="bg-white rounded border border-gray-200 p-2 text-xs">
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-blue-600">{event.type}</span>
        <span className="text-gray-500">{formattedTime}</span>
      </div>
      <pre className="bg-gray-50 p-2 rounded overflow-x-auto">{formattedJson}</pre>
    </div>
  );
}

export default function EventLog({ events }) {
  // group events by type
  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.type]) {
      acc[event.type] = [];
    }
    acc[event.type].push(event);
    return acc;
  }, {});

  return (
    <section className="h-full w-full overflow-auto p-1">
      <div className="h-full w-full bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold mb-4">Event Log</h2>
        {events.length === 0 ? (
          <p className="text-gray-600 italic">No events yet...</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupedEvents).map(([type, events]) => (
              <div key={type} className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{type} ({events.length})</h3>
                <div className="space-y-1">
                  {events.slice(0, 10).map((event, i) => (
                    <Event key={i} event={event} timestamp={event.timestamp} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
