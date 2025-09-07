import React, { useState } from 'react';
import { documentApi } from '../../services/api';
import type { OllamaResult } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AiAnalysisProcessorProps {
  file: File;
  onResult: (result: OllamaResult) => void;
  onError: (error: string) => void;
}

export const AiAnalysisProcessor: React.FC<AiAnalysisProcessorProps> = ({
  file,
  onResult,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OllamaResult | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const predefinedPrompts = [
    {
      name: 'Analyse générale',
      prompt: 'Analysez cette image et décrivez son contenu. Identifiez les éléments visuels, le texte visible, et fournissez une description détaillée.'
    },
    {
      name: 'Extraction de texte',
      prompt: 'Extrayez tout le texte visible dans cette image. Listez chaque élément de texte que vous pouvez identifier.'
    },
    {
      name: 'Analyse de document',
      prompt: 'Analysez ce document et identifiez son type, son contenu principal, et les informations importantes qu\'il contient.'
    },
    {
      name: 'Détection d\'objets',
      prompt: 'Identifiez et décrivez tous les objets, formes, et éléments visuels présents dans cette image.'
    },
    {
      name: 'Analyse de qualité',
      prompt: 'Évaluez la qualité de cette image et identifiez les problèmes potentiels (flou, contraste, résolution, etc.).'
    }
  ];

  const handleProcess = async (prompt?: string) => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const selectedPrompt = prompt || customPrompt || predefinedPrompts[0].prompt;
      console.log('🤖 Démarrage de l\'analyse IA pour:', file.name);
      
      const response = await documentApi.analyzeWithOllama(file, selectedPrompt);
      
      if (response.success && response.data) {
        const aiResult: OllamaResult = response.data;
        setResult(aiResult);
        onResult(aiResult);
        
        console.log('✅ Analyse IA terminée avec succès:', {
          model: aiResult.model,
          responseLength: aiResult.response.length
        });
      } else {
        throw new Error(response.error || 'Erreur lors de l\'analyse IA');
      }
    } catch (error: any) {
      console.error('❌ Erreur analyse IA:', error);
      onError(error.message || 'Erreur lors de l\'analyse IA');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (nanoseconds: number): string => {
    if (nanoseconds < 1000) return `${nanoseconds}ns`;
    if (nanoseconds < 1000000) return `${(nanoseconds / 1000).toFixed(2)}μs`;
    if (nanoseconds < 1000000000) return `${(nanoseconds / 1000000).toFixed(2)}ms`;
    return `${(nanoseconds / 1000000000).toFixed(2)}s`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Analyse IA</h3>
            <p className="text-sm text-gray-600">
              Analyse intelligente avec Ollama
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => handleProcess()}
          disabled={isProcessing}
          loading={isProcessing}
          variant="primary"
        >
          {isProcessing ? 'Analyse...' : 'Analyser avec IA'}
        </Button>
      </div>

      {/* Options d'analyse */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Options d'analyse</h4>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            size="sm"
          >
            {showAdvanced ? 'Masquer' : 'Avancé'}
          </Button>
        </div>

        {showAdvanced && (
          <div className="space-y-4">
            {/* Prompts prédéfinis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompts prédéfinis
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {predefinedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    onClick={() => handleProcess(prompt.prompt)}
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    className="justify-start text-left"
                  >
                    {prompt.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Prompt personnalisé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt personnalisé
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Entrez votre prompt personnalisé..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                disabled={isProcessing}
              />
              <Button
                onClick={() => handleProcess(customPrompt)}
                variant="primary"
                size="sm"
                disabled={isProcessing || !customPrompt.trim()}
                className="mt-2"
              >
                Analyser avec prompt personnalisé
              </Button>
            </div>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Analyse IA en cours...</span>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {/* Informations sur l'analyse */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Modèle utilisé</div>
              <div className="text-lg font-bold text-gray-900">{result.model}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Longueur de réponse</div>
              <div className="text-lg font-bold text-gray-900">{result.response.length} caractères</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Statut</div>
              <div className="text-lg font-bold text-gray-900">
                {result.done ? '✅ Terminé' : '⏳ En cours'}
              </div>
            </div>
          </div>

          {/* Métadonnées de performance */}
          {result.metadata && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Métadonnées de performance</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {result.metadata.totalDuration && (
                  <div>
                    <span className="text-blue-600 font-medium">Durée totale:</span>
                    <div className="text-blue-800">{formatDuration(result.metadata.totalDuration)}</div>
                  </div>
                )}
                {result.metadata.evalCount && (
                  <div>
                    <span className="text-blue-600 font-medium">Tokens évalués:</span>
                    <div className="text-blue-800">{result.metadata.evalCount}</div>
                  </div>
                )}
                {result.metadata.promptEvalCount && (
                  <div>
                    <span className="text-blue-600 font-medium">Tokens du prompt:</span>
                    <div className="text-blue-800">{result.metadata.promptEvalCount}</div>
                  </div>
                )}
                {result.metadata.evalDuration && (
                  <div>
                    <span className="text-blue-600 font-medium">Durée d'évaluation:</span>
                    <div className="text-blue-800">{formatDuration(result.metadata.evalDuration)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prompt utilisé */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Prompt utilisé</h4>
            <div className="text-sm text-gray-900 bg-white p-3 rounded border">
              {result.prompt}
            </div>
          </div>

          {/* Réponse de l'IA */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Réponse de l'IA
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-900">
                {result.response}
              </pre>
            </div>
          </div>

          {result.errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {result.errorMessage}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
