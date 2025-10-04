# Textflow-JS

This is a library that allows serial, progressive modification of a string through "commands" which map to functions.

```
let command1 = { name: 'append', arguments: { text: 'Append me!' }};
let command2 = { name: 'wrap', arguments: { tag: 'pre' }};

let p = new Pipeline([command1, command2]);
let result = p.execute("deane");

// result.text = "<pre>deaneAppend me!</pre>"
```

The pipeline object can be re-used multiple times.

In practice, the commands would be configured via some text parsing or UI-based process.