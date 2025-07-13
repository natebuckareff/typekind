import * as tk from './builder.js';

function main() {
  const userSchema = tk.record({
    id: tk.u64(),
    value: tk.some(tk.i32()),
    name: tk.string(),
    deleted: tk.bool(),
  });

  console.log('>>>', userSchema.serializeSchema());
}

main();
