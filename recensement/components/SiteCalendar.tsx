'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { EventClickArg } from '@fullcalendar/core';

interface FileEvent {
  title: string;
  start: string;
  url: string;
}

export default function SiteCalendar({ site, files }: { site: string; files: any[] }) {
  const [events, setEvents] = useState<FileEvent[]>([]);

  useEffect(() => {
    fetch(`/api/files/cd`)
      .then(res => res.json())
      .then((data) => {
        const evts = data.map((file: any) => {
          const hourMatch = file.name.match(/^(\d{2})/);
          const fileDate = new Date(file.modified);

          if (hourMatch) {
            const hour = parseInt(hourMatch[1]);
            fileDate.setHours(hour);
          }

          return {
            title: file.name,
            start: fileDate.toISOString(),
            url: `/files/${site}/${file.date.replace(/-/g, '/')}/${file.date}/${file.name}`,
          };
        });

        setEvents(evts);
      });
  }, [files, site]);

  const handleEventClick = (info: EventClickArg) => {
    if (!info.event.url) return;

    const url = new URL(info.event.url, window.location.href);
    const segments = url.pathname.split('/');

    const dateStr = `${segments[4]}-${segments[5]}-${segments[6]}`; // yyyy-mm-dd

    fetch(`/api/extract?site=${site}&date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Fichier extrait et prêt à être consulté.');
        } else {
          alert('Erreur lors de l\'extraction : ' + (data.error || 'Inconnue'));
        }
      });
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      events={events}
      height="auto"
      eventClick={handleEventClick}
    />
  );
}
