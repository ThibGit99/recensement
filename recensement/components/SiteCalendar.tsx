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
    fullFile: any;
  };
}

interface ExtractedFile {
  name: string;
  path: string;
  size?: number;
  type: string;
}

export default function SiteCalendar({ site, files }: { site: string; files: any[] }) {
  const [events, setEvents] = useState<FileEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);

  useEffect(() => {
    if (!files || files.length === 0) return;

    const evts = files.map((file: any) => {
      const dateStr = file.date;
      const fileDate = new Date(dateStr + 'T12:00:00');

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
          fullFile: file,
        },
      };
    });

    setEvents(evts);
  }, [files]);

  const handleEventClick = (info: EventClickArg) => {
    const { dateStr, fullFile } = info.event.extendedProps;
    
    // Trouve tous les fichiers de cette date
    const filesForDate = files.filter(f => f.date === dateStr);
    
    setSelectedDate(dateStr);
    setSelectedFiles(filesForDate);
    setExtractedFiles([]); // Reset les fichiers extraits
    
    // Scroll vers la section des fichiers
    setTimeout(() => {
      document.getElementById('files-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

const handleExtractFile = async (file: any) => {
  if (extracting) {
    alert('Extraction en cours, veuillez patienter...');
    return;
  }

  if (!confirm(`Extraire le fichier ${file.name} ?\n\nCela peut prendre quelques secondes.`)) {
    return;
  }

  setExtracting(file.name);

  try {
    const response = await fetch(`/api/extract?site=${site}&date=${file.date}`);
    const data = await response.json();

    if (data.success) {
      alert(` Fichier ${file.name} extrait avec succès !`);

      // On génère la liste de fichiers extraits depuis le dossier public/files/<site>
      const extracted: ExtractedFile[] = [
        {
          name: `${site}.csv`,
          path: `/files/[site]/${site}.csv`,
          type: 'csv'
        },
        {
          name: `${site}.png`,
          path: `/files/${site}/${site}.png`,
          type: 'png'
        }
      ];

      setExtractedFiles(extracted);
    } else {
      alert(` Erreur lors de l'extraction :\n\n${data.error || 'Erreur inconnue'}`);
    }
  } catch (error: any) {
    alert(` Erreur de réseau :\n\n${error.message}`);
  } finally {
    setExtracting(null);
  }
};

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Taille inconnue';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Statut d'extraction */}
      {extracting && (
        <div className="bg-blue-100 dark:bg-blue-900 border border-blue-400 text-blue-700 dark:text-blue-300 px-4 py-3 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-300 mr-2"></div>
            <span>Extraction en cours de <strong>{extracting}</strong>...</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
           Instructions d'utilisation
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Cliquez sur un événement (date) du calendrier pour voir les archives de cette journée</li>
          <li>• Les fichiers .7z s'afficheront en dessous du calendrier</li>
          <li>• Cliquez sur "Extraire" pour décompresser une archive</li>
          <li>• Les fichiers extraits seront listés après l'extraction</li>
        </ul>
        <div className="mt-2 text-sm">
          <strong>{events.length}</strong> archive(s) disponible(s) pour ce site
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
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
          eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
          eventDidMount={(info) => {
            info.el.title = `Voir les archives du ${info.event.extendedProps.dateStr}`;
          }}
          dayMaxEvents={3}
          moreLinkText="archives"
        />
      </div>

      {/* Section des fichiers */}
      {selectedDate && selectedFiles.length > 0 && (
        <div id="files-section" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
             Archives du {formatDate(selectedDate)}
          </h3>
          
          <div className="grid gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                       {file.name}
                    </h4>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>Modifié le : {new Date(file.modified).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleExtractFile(file)}
                    disabled={extracting === file.name}
                    className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                  >
                    {extracting === file.name ? 'Extraction...' : 'Extraire'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fichiers extraits */}
      {extractedFiles.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-green-800 dark:text-green-200">
           Fichiers extraits
          </h3>
          <div className="grid gap-2">
            {extractedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {file.type === 'html' ? '🌐' : 
                     file.type === 'css' ? '🎨' : 
                     file.type === 'js' ? '⚡' : '📄'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{file.name}</div>
                    {file.size && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </div>
                    )}
                  </div>
                </div>
                <a
                  href={file.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                >
                  Ouvrir
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}