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
  async generateTasks(prompt: string): Promise<AITaskSuggestion[]> {
    try {
      console.log('🤖 Generando tareas con prompt:', prompt);

      const systemPrompt = `Eres un asistente de productividad experto. Genera tareas específicas y accionables.

IMPORTANTE:
- Genera entre 3 y 5 tareas
- Títulos cortos (máximo 40 caracteres)
- Descripciones claras (máximo 100 caracteres)
- Solo letras, números, espacios y tildes
- Tareas realistas y específicas

Responde SOLO con un JSON válido, sin texto adicional, sin markdown:
[{"title":"título aquí","description":"descripción aquí"}]`;

      const result = await model.generateContent([
        systemPrompt,
        `Usuario pide: ${prompt}`,
      ]);

      const response = result.response.text();
      console.log('📝 Respuesta raw de Gemini:', response);

      // Limpiar respuesta
      let jsonText = response.trim();
      
      // Remover markdown
      jsonText = jsonText.replace(/```json\n?/g, '');
      jsonText = jsonText.replace(/```\n?/g, '');
      jsonText = jsonText.trim();

      console.log('🧹 Texto limpio:', jsonText);

      // Intentar parsear
      const tasks: AITaskSuggestion[] = JSON.parse(jsonText);

      // Validar que sea un array
      if (!Array.isArray(tasks)) {
        throw new Error('La respuesta no es un array');
      }

      // Limpiar y validar tareas
      const cleanedTasks = tasks
        .filter(task => task.title && task.description)
        .map(task => ({
          title: task.title.slice(0, 50).trim(),
          description: task.description.slice(0, 150).trim(),
        }))
        .slice(0, 5);

      console.log('✅ Tareas generadas:', cleanedTasks);

      if (cleanedTasks.length === 0) {
        throw new Error('No se generaron tareas válidas');
      }

      return cleanedTasks;

    } catch (error: any) {
      console.error('❌ Error completo:', error);
      
      // Mensajes de error más específicos
      if (error.message?.includes('API key')) {
        throw new Error('API Key inválida. Verifica tu configuración.');
      }
      
      if (error.message?.includes('quota')) {
        throw new Error('Límite de API alcanzado. Intenta más tarde.');
      }

      if (error.message?.includes('JSON')) {
        throw new Error('Error al procesar respuesta. Intenta con otro prompt.');
      }

      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error('Error de conexión. Verifica tu internet.');
      }

      throw new Error('No se pudieron generar tareas. Intenta de nuevo.');
    }
  },

  async improveTask(title: string, description: string): Promise<AITaskSuggestion> {
    try {
      const systemPrompt = `Mejora esta tarea haciéndola más específica y accionable.

REGLAS:
- Título: máximo 40 caracteres
- Descripción: máximo 100 caracteres
- Solo letras, números, espacios y tildes

Responde SOLO con JSON:
{"title":"título mejorado","description":"descripción mejorada"}`;

      const result = await model.generateContent([
        systemPrompt,
        `Tarea: ${title}\nDescripción: ${description}`,
      ]);

      const response = result.response.text();
      let jsonText = response.trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

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

  async suggestNextTasks(completedTasks: string[]): Promise<AITaskSuggestion[]> {
    try {
      const systemPrompt = `Basándote en estas tareas completadas, sugiere 3 nuevas tareas relacionadas.

REGLAS:
- Exactamente 3 tareas
- Relacionadas pero no repetitivas
- Título: máximo 40 caracteres
- Descripción: máximo 100 caracteres

Responde SOLO con JSON:
[{"title":"título","description":"descripción"}]`;

      const tasksList = completedTasks.slice(0, 5).join(', ');
      
      const result = await model.generateContent([
        systemPrompt,
        `Tareas completadas: ${tasksList}`,
      ]);

      const response = result.response.text();
      let jsonText = response.trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

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