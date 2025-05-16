import { useState } from "react";
import { ArrowDown, ArrowUp } from "react-feather";

function Event({ event, timestamp }: { event: any; timestamp: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isClient = event.event_id && !event.event_id.startsWith("event_");

  return (
    <div className="flex flex-col gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isClient ? (
          <ArrowDown className="text-blue-400" />
        ) : (
          <ArrowUp className="text-green-400" />
        )}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {isClient ? "client:" : "server:"}
          &nbsp;{event.type} | {timestamp}
        </div>
      </div>
      <div
        className={`text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 p-2 rounded-md overflow-x-auto ${
          isExpanded ? "block" : "hidden"
        }`}
      >
        <pre className="text-xs">{JSON.stringify(event, null, 2)}</pre>
      </div>
    </div>
  );
}

export default function EventLog({ events }: { events: any[] }) {
  const eventsToDisplay: any[] = [];
  const deltaEvents: Record<string, any> = {};

  events.forEach((event) => {
    if (event.type.endsWith("delta")) {
      if (deltaEvents[event.type]) {
        // for now just log a single event per render pass
        return;
      } else {
        deltaEvents[event.type] = event;
      }
    }

    eventsToDisplay.push(
      <Event key={event.event_id} event={event} timestamp={event.timestamp} />,
    );
  });

  return (
    <div className="flex flex-col gap-3 p-3 h-full overflow-y-auto">
      {events.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">
          Awaiting events...
        </div>
      ) : (
        eventsToDisplay
      )}
    </div>
  );
}
