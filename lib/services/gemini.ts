import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('⚠️ GEMINI API KEY no configurada. Por favor configura EXPO_PUBLIC_GEMINI_API_KEY en .env');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Gemini 2.0 Flash Experimental - El modelo más rápido y reciente
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
});

export interface AITaskSuggestion {
  title: string;
  description: string;
}

export const geminiService = {
  async generateTasks(prompt: string): Promise<AITaskSuggestion[]> {
    try {
      console.log('🤖 Gemini 2.0 Flash - Generando tareas con prompt:', prompt);

      const systemPrompt = `Eres un asistente experto en productividad usando Gemini 2.0 Flash.

INSTRUCCIONES CRÍTICAS:
- Genera entre 3 y 5 tareas específicas y accionables
- Títulos: máximo 50 caracteres, claros y concisos
- Descripciones: máximo 150 caracteres, detalladas pero breves
- Solo usa letras, números, espacios y tildes (á, é, í, ó, ú, ñ, ü)
- Tareas deben ser realistas y alcanzables
- Enfócate en pasos concretos, no conceptos abstractos

FORMATO DE RESPUESTA:
Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown, sin explicaciones:
[
  {"title":"Título conciso aquí","description":"Descripción clara aquí"},
  {"title":"Otro título","description":"Otra descripción"}
]

Prompt del usuario: "${prompt}"

Genera las tareas ahora:`;

      const result = await model.generateContent(systemPrompt);
      const response = result.response.text();
      
      console.log('📝 Respuesta raw de Gemini 2.0:', response);

      // Limpiar la respuesta (remover markdown, espacios, etc)
      let jsonText = response.trim();
      
      // Remover bloques de código markdown
      jsonText = jsonText.replace(/```json\n?/gi, '');
      jsonText = jsonText.replace(/```\n?/g, '');
      
      // Remover posible texto antes/después del JSON
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      jsonText = jsonText.trim();
      console.log('🧹 JSON limpio:', jsonText);

      // Parsear JSON
      const tasks: AITaskSuggestion[] = JSON.parse(jsonText);

      // Validar que sea un array
      if (!Array.isArray(tasks)) {
        throw new Error('La respuesta no es un array válido');
      }

      // Limpiar y validar cada tarea
      const cleanedTasks = tasks
        .filter(task => task && task.title && task.description)
        .map(task => ({
          title: task.title.slice(0, 50).trim(),
          description: task.description.slice(0, 150).trim(),
        }))
        .slice(0, 5); // Máximo 5 tareas

      console.log('✅ Tareas generadas exitosamente:', cleanedTasks);

      if (cleanedTasks.length === 0) {
        throw new Error('No se generaron tareas válidas');
      }

      return cleanedTasks;

    } catch (error: any) {
      console.error('❌ Error en Gemini 2.0 Flash:', error);
      
      // Mensajes de error más específicos
      if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
        throw new Error('API Key inválida o no configurada. Verifica tu archivo .env');
      }
      
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        throw new Error('Límite de solicitudes alcanzado. Intenta en unos minutos.');
      }

      if (error.message?.includes('JSON') || error.message?.includes('parse')) {
        console.error('Error parseando JSON. Respuesta recibida:', error);
        throw new Error('Error al procesar la respuesta. Intenta con un prompt diferente.');
      }

      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error('Error de conexión. Verifica tu internet.');
      }

      throw new Error(`Error generando tareas: ${error.message}`);
    }
  },

  async improveTask(title: string, description: string): Promise<AITaskSuggestion> {
    try {
      console.log('✨ Gemini 2.0 Flash - Mejorando tarea...');

      const systemPrompt = `Mejora esta tarea haciéndola más específica, accionable y clara.

REGLAS:
- Título: máximo 50 caracteres, directo y claro
- Descripción: máximo 150 caracteres, específica y detallada
- Solo letras, números, espacios y tildes
- Enfócate en ACCIONES concretas

Tarea actual:
Título: "${title}"
Descripción: "${description}"

Responde SOLO con JSON (sin markdown, sin texto extra):
{"title":"título mejorado","description":"descripción mejorada"}`;

      const result = await model.generateContent(systemPrompt);
      const response = result.response.text();
      
      let jsonText = response.trim()
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();

      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const improved: AITaskSuggestion = JSON.parse(jsonText);
      
      console.log('✅ Tarea mejorada:', improved);
      
      return {
        title: improved.title.slice(0, 50).trim(),
        description: improved.description.slice(0, 150).trim(),
      };

    } catch (error: any) {
      console.error('Error al mejorar tarea:', error);
      throw new Error('No se pudo mejorar la tarea. Intenta de nuevo.');
    }
  },

  async suggestNextTasks(completedTasks: string[]): Promise<AITaskSuggestion[]> {
    try {
      console.log('🎯 Gemini 2.0 Flash - Sugiriendo siguientes tareas...');

      const systemPrompt = `Basándote en estas tareas completadas, sugiere 3 nuevas tareas lógicas y relacionadas.

Tareas completadas:
${completedTasks.slice(0, 5).map((t, i) => `${i + 1}. ${t}`).join('\n')}

REGLAS:
- Exactamente 3 tareas nuevas
- Deben ser el siguiente paso lógico
- No repetir las tareas completadas
- Título: máximo 50 caracteres
- Descripción: máximo 150 caracteres

Responde SOLO con JSON (sin markdown):
[
  {"title":"título 1","description":"descripción 1"},
  {"title":"título 2","description":"descripción 2"},
  {"title":"título 3","description":"descripción 3"}
]`;

      const result = await model.generateContent(systemPrompt);
      const response = result.response.text();
      
      let jsonText = response.trim()
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();

      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const tasks: AITaskSuggestion[] = JSON.parse(jsonText);
      
      const cleanedTasks = tasks
        .filter(task => task && task.title && task.description)
        .map(task => ({
          title: task.title.slice(0, 50).trim(),
          description: task.description.slice(0, 150).trim(),
        }))
        .slice(0, 3);

      console.log('✅ Sugerencias generadas:', cleanedTasks);
      
      return cleanedTasks;

    } catch (error: any) {
      console.error('Error al sugerir tareas:', error);
      throw new Error('No se pudieron generar sugerencias.');
    }
  },
};