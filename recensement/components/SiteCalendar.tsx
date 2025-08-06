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
  const [extracting, setExtracting] = useState<string | null>(null);

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

    // Empêche les clics multiples pendant l'extraction
    if (extracting) {
      alert('Extraction en cours, veuillez patienter...');
      return;
    }

    if (confirm(`Extraire le fichier ${fileName} ?\n\nCela peut prendre quelques secondes.`)) {
      setExtracting(fileName);
      
      fetch(`/api/extract?site=${site}&date=${dateStr}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert(` Fichier ${fileName} extrait avec succès !\n\nLes fichiers sont maintenant disponibles dans le dossier de destination.`);
          } else {
            alert(` Erreur lors de l'extraction de ${fileName} :\n\n${data.error || 'Erreur inconnue'}`);
          }
        })
        .catch(error => {
          alert(` Erreur de réseau lors de l'extraction :\n\n${error.message}`);
        })
        .finally(() => {
          setExtracting(null);
        });
    }
  };

  return (
    <div className="w-full">
      {extracting && (
        <div className="bg-blue-100 dark:bg-blue-900 border border-blue-400 text-blue-700 dark:text-blue-300 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-300 mr-2"></div>
            <span>Extraction en cours de <strong>{extracting}</strong>...</span>
          </div>
        </div>
      )}

      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Instructions :</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Cliquez sur un événement du calendrier pour extraire l'archive</li>
          <li>• L'extraction peut prendre quelques secondes selon la taille du fichier</li>
          <li>• Les fichiers extraits seront disponibles en dessous</li>
        </ul>
      </div>

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
        eventClassNames="cursor-pointer hover:opacity-80"
        eventDidMount={(info) => {
          // Ajoute un tooltip
          info.el.title = `Cliquer pour extraire ${info.event.extendedProps.fileName}`;
        }}
      />

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p><strong>{events.length}</strong> archive(s) disponible(s) pour ce site</p>
      </div>
    </div>
  );
}