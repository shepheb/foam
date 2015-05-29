#ifndef VM_H
#define VM_H

// External API for VM calls.

typedef uint32_t opcode;

typedef struct _vm_call {
  struct _vm_call *parent;
  object* self;
  opcode* pc;          // Address of the next VM opcode to execute.
} vm_call;


// Represents the state of one thread of VM execution. Contains its own stack,
// sp, and return stack.
typedef struct _vm_state {
  void* stack[1022];
  int sp;        // Indexes into the stack above. Full-ascending, from 0.
  vm_call* call; // Points at the current call's activation record.
} vm_state;

typedef void (*op_impl)(vm_state*, uint32_t);

// Add the external functions here, when there are some.

#endif // VM_H
