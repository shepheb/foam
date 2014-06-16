# FOAMScript

FOAMScript is a language that compiles to Javascript (for now). Its syntax generally resembles Dart, ie. a better, optional-types Javascript.

## Overview

FOAMScript supports several interesting features not found in Javascript:

- Explicit contexts: Every scope is a first-class object. Functions inherit the enclosing context at the time of their creation, similar to closures. `f.withContext(s)` calls the function while overriding its context. `X` is always bound to the current dynamic context.
- Explicit threading. Javascript can't support that, but we can fake it. Threads can be blocked and resumed, and therefore we can write "blocking" calls that pause the current thread without blocking others, and return when their async result is ready.
- Better function syntax:
    ```
    (foo, bar) ->
      var x = foo.baz(bar);
      return new Brub(x);
    ```

    and for one-liners:
    ```
    (foo, bar) => foo.baz(bar)
    ```
    whose body is a single expression, and returns that value.
- Multi-line strings with Python-style `"""long strings"""`.
- Partial evaluation: functions can be partially applied, thus: `f.partial(a,b)(x,y)` is equivalent to `f(a,b,x,y)`.
- Symbols: `\`symbol` is a unique symbol (equivalent to `'symbol'.intern()`)
- Optional dereferencing: `foo?bar(baz)` is equivalent to `foo && foo.bar(baz)` in Javascript.
- Nested comments: `/* ... */` comments are nesting.
- Functional programming niceties:
    - Partial evaluation, as above.
    - Inline method application: `#foo(x,y,z)` returns a function like `function(c) { return foo.call(c, x, y, z); }`
- **MAYBE** reactive programming sugar. `:=` for dynamic binding?
- **MAYBE**: Implicit return. Coffeescript does this, but it occasionally has unintended consequences. `()=>...` one-liner functions might obviate the need for this?
- **MAYBE**: Unify the global and map syntax? Not sure what this means.

## Workflow

Compiles into unreadable Javascript code with some runtime hackery. Hopefully we can do all this without introducing painful runtime overhead. The Dart folks had trouble with this, but we're taking a different approach with models than with Dart classes.

Needs to be compiled into the target language. The compiler command is `fsc`.

## Target Languages

Javascript, for now. Shortly thereafter, Java. Next is probably Obj-C.

## Internals

The compiler is implemented in Javascript, using FOAM on Node.js.

### Target-independent steps

- Uses FOAM's parser combinators to build an AST (see below for AST details).
    - The AST is modelled, naturally.
- Runs a combined type-checking and type-inference pass over the AST, annotating it.

### Target-dependent Steps

- Output phase: generating code for the target languages.


### File Structure

- `fsc` is a thin wrapper that implements the command-line argument handling.
- `fsc.js` is the main module, it contains `FSCompiler` which coordinates the whole compiler.
- `parsing.js` is obvious.
- `ast.js` contains the various models for the AST and its components.
- `types.js` contains the type-checker and type inference engine.
- `lib/$language/` directories contain the handwritten target language code to be included.
    - We have the goal of a minimum amount of runtime support in the target languages, but some is still required.

