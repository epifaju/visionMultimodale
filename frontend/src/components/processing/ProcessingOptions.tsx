import React from 'react';
import type { ProcessingOptions as ProcessingOptionsType } from '../../types';
import Card from '../ui/Card';

interface ProcessingOptionsProps {
  options: ProcessingOptionsType;
  onOptionsChange: (options: ProcessingOptionsType) => void;
  disabled?: boolean;
}

export const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({
  options,
  onOptionsChange,
  disabled = false,
}) => {
  const handleOptionChange = (key: keyof ProcessingOptionsType, value: boolean | string) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const processingSteps = [
    {
      id: 'ocr',
      name: 'Extraction OCR',
      description: 'Extraire le texte depuis les images',
      icon: '🔍',
      enabled: options.enableOcr,
      onChange: (enabled: boolean) => handleOptionChange('enableOcr', enabled),
    },
    {
      id: 'pdf',
      name: 'Extraction PDF',
      description: 'Extraire le texte et métadonnées des PDF',
      icon: '📄',
      enabled: options.enablePdf,
      onChange: (enabled: boolean) => handleOptionChange('enablePdf', enabled),
    },
    {
      id: 'barcode',
      name: 'Lecture codes-barres',
      description: 'Détecter et lire les codes-barres et QR codes',
      icon: '📊',
      enabled: options.enableBarcode,
      onChange: (enabled: boolean) => handleOptionChange('enableBarcode', enabled),
    },
    {
      id: 'mrz',
      name: 'Extraction MRZ',
      description: 'Extraire les données d\'identité depuis la zone MRZ',
      icon: '🆔',
      enabled: options.enableMrz,
      onChange: (enabled: boolean) => handleOptionChange('enableMrz', enabled),
    },
    {
      id: 'ollama',
      name: 'Analyse IA',
      description: 'Analyse intelligente avec Ollama',
      icon: '🤖',
      enabled: options.enableOllama,
      onChange: (enabled: boolean) => handleOptionChange('enableOllama', enabled),
    },
  ];

  const enabledCount = processingSteps.filter(step => step.enabled).length;

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Options de traitement
        </h3>
        <p className="text-sm text-gray-600">
          Sélectionnez les types de traitement à appliquer à votre document.
          {enabledCount > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              {enabledCount} option{enabledCount > 1 ? 's' : ''} sélectionnée{enabledCount > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processingSteps.map((step) => (
          <div
            key={step.id}
            className={`relative border rounded-lg p-4 transition-all duration-200 ${
              step.enabled
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => !disabled && step.onChange(!step.enabled)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">{step.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {step.name}
                  </h4>
                  <input
                    type="checkbox"
                    checked={step.enabled}
                    onChange={(e) => step.onChange(e.target.checked)}
                    disabled={disabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Options avancées pour Ollama */}
      {options.enableOllama && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Options avancées pour l'analyse IA
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt personnalisé (optionnel)
              </label>
              <textarea
                value={options.customPrompt || ''}
                onChange={(e) => handleOptionChange('customPrompt', e.target.value)}
                placeholder="Laissez vide pour utiliser le prompt par défaut..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue cible pour la traduction (optionnel)
              </label>
              <select
                value={options.targetLanguage || ''}
                onChange={(e) => handleOptionChange('targetLanguage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={disabled}
              >
                <option value="">Aucune traduction</option>
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="es">Espagnol</option>
                <option value="de">Allemand</option>
                <option value="it">Italien</option>
                <option value="pt">Portugais</option>
                <option value="ru">Russe</option>
                <option value="ja">Japonais</option>
                <option value="ko">Coréen</option>
                <option value="zh">Chinois</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Message d'avertissement si aucune option sélectionnée */}
      {enabledCount === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Aucune option sélectionnée
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                Veuillez sélectionner au moins une option de traitement pour analyser votre document.
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
