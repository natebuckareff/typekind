import { Schema } from './core.js';

export type Infer<S extends Schema<any>> = S['Type'];
