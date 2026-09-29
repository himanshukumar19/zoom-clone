"use client";

import { useEffect, useState } from "react";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const weekday = WEEKDAYS[now.getDay()];
  const month = MONTHS[now.getMonth()];
  const day = now.getDate();

  // 12-hour format with AM/PM — matches Zoom web client reference
  const rawHour = now.getHours();
  const amPm = rawHour >= 12 ? "PM" : "AM";
  const hour12 = rawHour % 12 === 0 ? 12 : rawHour % 12;
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center gap-1 select-none">
      <time
        suppressHydrationWarning
        dateTime={now.toISOString()}
        className="text-7xl font-black text-ink tabular-nums tracking-tight leading-none"
      >
        {hour12}:{minutes}{" "}
        <span className="text-5xl font-extrabold">{amPm}</span>
      </time>
      <span className="text-base font-medium text-muted mt-1">
        {weekday}, {month} {day}
      </span>
    </div>
  );
}
