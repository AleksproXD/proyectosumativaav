import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('⚠️ GEMINI API KEY no configurada');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export interface AITaskSuggestion {
  title: string;
  description: string;
}

export const geminiService = {
  // Generar tareas a partir de un prompt
  async generateTasks(prompt: string): Promise<AITaskSuggestion[]> {
    try {
      const systemPrompt = `Eres un asistente de productividad. Tu trabajo es generar tareas específicas y accionables basadas en lo que el usuario te pide.

REGLAS IMPORTANTES:
- Genera entre 1 y 5 tareas máximo
- Cada tarea debe tener un título corto (máximo 50 caracteres)
- Cada descripción debe ser clara y específica (máximo 150 caracteres)
- Usa solo letras, números y espacios (sin caracteres especiales)
- Las tareas deben ser realistas y accionables

RESPONDE SOLO EN FORMATO JSON, sin markdown ni explicaciones:
[
  {
    "title": "título de la tarea",
    "description": "descripción detallada"
  }
]`;

      const result = await model.generateContent([
        systemPrompt,
        `\nPrompt del usuario: ${prompt}\n\nGenera las tareas en JSON:`
      ]);

      const response = result.response.text();
      
      // Limpiar la respuesta (remover markdown si existe)
      let jsonText = response.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const tasks: AITaskSuggestion[] = JSON.parse(jsonText);
      
      // Validar y limpiar tareas
      return tasks.map(task => ({
        title: task.title.slice(0, 50).trim(),
        description: task.description.slice(0, 150).trim(),
      })).slice(0, 5); // Máximo 5 tareas

    } catch (error) {
      console.error('Error al generar tareas con IA:', error);
      throw new Error('No se pudieron generar tareas. Intenta con otro prompt.');
    }
  },

  // Mejorar una tarea existente
  async improveTask(title: string, description: string): Promise<AITaskSuggestion> {
    try {
      const systemPrompt = `Eres un experto en productividad. Mejora la siguiente tarea haciéndola más específica, clara y accionable.

REGLAS:
- Título: máximo 50 caracteres
- Descripción: máximo 150 caracteres
- Solo letras, números y espacios
- Hazla más específica y accionable

RESPONDE SOLO EN FORMATO JSON:
{
  "title": "título mejorado",
  "description": "descripción mejorada"
}`;

      const result = await model.generateContent([
        systemPrompt,
        `\nTarea actual:\nTítulo: ${title}\nDescripción: ${description}\n\nMejora esta tarea:`
      ]);

      const response = result.response.text();
      let jsonText = response.trim();
      
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const improved: AITaskSuggestion = JSON.parse(jsonText);
      
      return {
        title: improved.title.slice(0, 50).trim(),
        description: improved.description.slice(0, 150).trim(),
      };

    } catch (error) {
      console.error('Error al mejorar tarea:', error);
      throw new Error('No se pudo mejorar la tarea.');
    }
  },

  // Generar sugerencias de tareas basadas en las existentes
  async suggestNextTasks(completedTasks: string[]): Promise<AITaskSuggestion[]> {
    try {
      const systemPrompt = `Eres un asistente de productividad. Basándote en las tareas que el usuario ya completó, sugiere 3 tareas relacionadas que podría hacer a continuación.

REGLAS:
- Genera exactamente 3 tareas
- Que sean relacionadas pero no repetitivas
- Título: máximo 50 caracteres
- Descripción: máximo 150 caracteres
- Solo letras, números y espacios

RESPONDE SOLO EN FORMATO JSON:
[
  {
    "title": "título",
    "description": "descripción"
  }
]`;

      const tasksList = completedTasks.slice(0, 5).join(', ');
      
      const result = await model.generateContent([
        systemPrompt,
        `\nTareas completadas: ${tasksList}\n\nSugiere 3 tareas nuevas:`
      ]);

      const response = result.response.text();
      let jsonText = response.trim();
      
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const tasks: AITaskSuggestion[] = JSON.parse(jsonText);
      
      return tasks.map(task => ({
        title: task.title.slice(0, 50).trim(),
        description: task.description.slice(0, 150).trim(),
      })).slice(0, 3);

    } catch (error) {
      console.error('Error al sugerir tareas:', error);
      throw new Error('No se pudieron generar sugerencias.');
    }
  },
};