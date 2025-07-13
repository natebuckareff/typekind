import { Schema } from './core.js';

export type InferType<S extends Schema<any>> = S['Type'];
