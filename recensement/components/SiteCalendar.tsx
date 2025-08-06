'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { EventClickArg } from '@fullcalendar/core';

interface FileEvent {
  title: string;
  start: string;
  extendedProps: {
    fileName: string;
    dateStr: string;
  };
}

export default function SiteCalendar({ site, files }: { site: string; files: any[] }) {
  const [events, setEvents] = useState<FileEvent[]>([]);

  useEffect(() => {
    if (!files || files.length === 0) return;

    const evts = files.map((file: any) => {
      // Parse la date depuis le nom du fichier (format: yyyy-mm-dd.7z)
      const dateStr = file.date; // Déjà au format yyyy-mm-dd
      const fileDate = new Date(dateStr + 'T12:00:00'); // Ajoute une heure par défaut

      // Essaie d'extraire l'heure depuis le nom si présent
      const hourMatch = file.name.match(/(\d{2})\d{2}-\d{2}-\d{2}/);
      if (hourMatch) {
        const hour = parseInt(hourMatch[1]);
        if (hour >= 0 && hour <= 23) {
          fileDate.setHours(hour);
        }
      }

      return {
        title: file.name.replace('.7z', ''),
        start: fileDate.toISOString(),
        extendedProps: {
          fileName: file.name,
          dateStr: dateStr,
        },
      };
    });

    setEvents(evts);
  }, [files]);

  const handleEventClick = (info: EventClickArg) => {
    const { fileName, dateStr } = info.event.extendedProps;

    if (confirm(`Extraire le fichier ${fileName} ?`)) {
      fetch(`/api/extract?site=${site}&date=${dateStr}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('Fichier extrait et prêt à être consulté.');
          } else {
            alert('Erreur lors de l\'extraction : ' + (data.error || 'Inconnue'));
          }
        })
        .catch(error => {
          alert('Erreur de réseau : ' + error.message);
        });
    }
  };

  return (
    <div className="w-full">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
        locale="fr"
      />
    </div>
  );
}