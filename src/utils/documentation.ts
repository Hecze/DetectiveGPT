import { z, ZodSchema, ZodObject, ZodString, ZodNumber, ZodBoolean, ZodArray, ZodEnum, ZodType } from 'zod';

/**
 * Genera documentación textual a partir de un esquema Zod.
 *
 * @param {ZodSchema<any>} schema - El esquema Zod del cual generar la documentación.
 * @returns {string} - Documentación generada en formato texto.
 */
export function generateDocumentation(schema: ZodSchema<any>): string {
  if (schema instanceof ZodObject) {
    return generateObjectDocumentation(schema);
  }
  return 'Unsupported schema type';
}

/**
 * Genera documentación textual a partir de un esquema ZodObject.
 *
 * @param {ZodObject<any>} schema - El esquema ZodObject del cual generar la documentación.
 * @returns {string} - Documentación generada en formato texto.
 */
function generateObjectDocumentation(schema: ZodObject<any>): string {
  const shape = schema.shape;
  return Object.entries(shape).map(([key, value]) => {
    const description = (value as any).description ?? 'No description available.';
    const type = getZodType(value as ZodType<any, any, any>);
    return `- **${key}** (${type}): ${description}`;
  }).join('\n');
}

/**
 * Obtiene el tipo de un esquema Zod.
 *
 * @param {ZodType<any, any, any>} schema - El esquema Zod del cual obtener el tipo.
 * @returns {string} - Tipo del esquema Zod.
 */
function getZodType(schema: ZodType<any, any, any>): string {
  if (schema instanceof ZodString) return 'string';
  if (schema instanceof ZodNumber) return 'number';
  if (schema instanceof ZodBoolean) return 'boolean';
  if (schema instanceof ZodArray) return 'array';
  if (schema instanceof ZodEnum) return 'enum';
  // Puedes agregar más casos aquí si usas otros tipos de Zod.
  return 'unknown';
}
