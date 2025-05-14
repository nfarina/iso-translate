function Event({ event, timestamp }: { event: any; timestamp: number }) {
  if (!event) {
    return;
  }

  // Format timestamp
  const date = new Date(timestamp);
  const formattedTime = date.toLocaleTimeString();

  // Create JSON view
  const formattedJson = JSON.stringify(event, null, 2);

  return (
    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2 text-xs">
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-blue-600 dark:text-blue-400">
          {event.type}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {formattedTime}
        </span>
      </div>
      <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto dark:text-gray-300">
        {formattedJson}
      </pre>
    </div>
  );
}

export default function EventLog({ events }: { events: any[] }) {
  // group events by type
  const groupedEvents: Record<string, any[]> = events.reduce(
    (acc: any, event: any) => {
      if (!acc[event.type]) {
        acc[event.type] = [];
      }
      acc[event.type].push(event);
      return acc;
    },
    {},
  );

  return (
    <>
      <h2 className="text-lg font-bold mb-4 dark:text-white">Event Log</h2>
      {events.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 italic">
          No events yet...
        </p>
      ) : (
        <div className="space-y-2">
          {Object.entries(groupedEvents).map(([type, events]) => (
            <div key={type} className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {type} ({events.length})
              </h3>
              <div className="space-y-1">
                {events.slice(0, 10).map((event, i) => (
                  <Event key={i} event={event} timestamp={event.timestamp} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
