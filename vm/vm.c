#include <stdlib.h>

#include <model.h>
#include <vm.h>
#include <vm_int.h>

// Implementation of a FOAM virtual machine.
// This is fundamentally a stack-powered, message passing machine.
// There is a stack of pointer-sized operands, similar to a Forth system or the
// JVM.
// Arguments to message sends go on this stack. There are VM opcodes for
// manipulating the stack, a la Forth.
//
// The VM also tracks a few context-aware variables. The SELF opcode always
// pushes the current message's receiver, which is nearly always defined.
//
// See vm_int.h for a fuller description of the VM's internals and opcodes.
// vm.h describes the API for the rest of the engine to invoke the VM.
//
// The VM's operation is tied to that of the allocator and garbage collector,
// but since neither is yet written, nothing more can be said here.


void vm_push(vm_state *st, object* value) {
  st->stack[++(st->sp)] = value;
}
object* vm_peek(vm_state *st) {
  return st->stack[st->sp];
}
object* vm_pop(vm_state *st) {
  return st->stack[(st->sp)--];
}

vm_state* vm_new_state() {
  vm_state* st = (vm_state*) malloc(sizeof(vm_state));
  st->sp = 0;
  st->call = NULL;
  return st;
}


// Opcode implementations
OPCODE(NOP) { }
OPCODE(RET) {
  st->call = st->call->parent;
}

OPCODE(DROP) {
  vm_pop(st);
}

OPCODE(DUP) {
  vm_push(st, vm_peek(st));
}

OPCODE(SWAP) {
  object* a = vm_pop(st);
  object* b = vm_pop(st);
  vm_push(st, a);
  vm_push(st, b);
}

OPCODE(PICK) {
  object* value = st->stack[st->sp - arg];
  vm_push(st, value);
}

OPCODE(OVER) {
  vm_op_PICK(st, 1);
}

OPCODE(SELF) {
  vm_push(st, st->call->self);
}

OPCODE(SEND) {
  object* receiver = vm_pop(st);
  uintptr_t code = ((uintptr_t*)receiver->model_)[arg];
  if (code & PTR_TAG_MASK_BYTECODE) {
    // The code is written in bytecode; set up a VM call for it.
    vm_call* newCall = (vm_call*) malloc(sizeof(vm_call));
    newCall->pc = (opcode*) PTR_CLEAR_TAGS(code);
    newCall->self = receiver;
    newCall->parent = st->call;
    st->call = newCall;
    // Return and let the main VM loop call into the next chunk.
  } else {
    // This is native C code. Call it directly.
    // This cast is one of the ugliest things I've ever written.
    void (*realcode)(vm_state*, object*) = (void(*)(vm_state*, object*)) PTR_CLEAR_TAGS(code);
    (*realcode)(st, receiver);
  }
}

op_impl ops[0xff] = {
  &vm_op_NOP,   // 0
  &vm_op_RET,   // 1
  0,            // 2
  0,            // 3
  0,            // 4
  0,            // 5
  0,            // 6
  0,            // 7
  0,            // 8
  0,            // 9
  0,            // 10
  0,            // 11
  0,            // 12
  0,            // 13
  0,            // 14
  0,            // 15
  &vm_op_DROP,  // 16
  &vm_op_DUP,   // 17
  &vm_op_SWAP,  // 18
  &vm_op_OVER,  // 19
  &vm_op_PICK,  // 20
  0,            // 21
  0,            // 22
  0,            // 23
  0,            // 24
  0,            // 25
  0,            // 26
  0,            // 27
  0,            // 28
  0,            // 29
  0,            // 30
  0,            // 31
  0,            // 32
  0,            // 33
  0,            // 34
  0,            // 35
  0,            // 36
  0,            // 37
  0,            // 38
  0,            // 39
  0,            // 40
  0,            // 41
  0,            // 42
  0,            // 43
  0,            // 44
  0,            // 45
  0,            // 46
  0,            // 47
  0,            // 48
  0,            // 49
  0,            // 50
  0,            // 51
  0,            // 52
  0,            // 53
  0,            // 54
  0,            // 55
  0,            // 56
  0,            // 57
  0,            // 58
  0,            // 59
  0,            // 60
  0,            // 61
  0,            // 62
  0,            // 63
  &vm_op_SELF,  // 64
  &vm_op_SEND   // 65
};

// Runs the next single opcode
void vm_run_op(vm_state* st) {
  // TODO(braden): Verify that the below ++ actually bumps by an opcode.
  opcode op = *(st->call->pc++);
  uint32_t op_number = OPCODE_NUMBER(op);
  uint32_t op_arg = OPCODE_ARGUMENT(op);
  op_impl code = ops[op_number];
  (*code)(st, op_arg);
}

// Runs the given VM thread to completion (top-level return, essentially).
// TODO(braden): Some kind of scheduler and threading. Trivial, amirite?
void vm_loop(vm_state* st) {
  while (st->call != NULL) {
    vm_run_op(st);
  }
}


// External function, called with a code pointer to run.
// Handles either native or VM code based on the tag.
void vm_execute(vm_state* st, void* code) {
}
