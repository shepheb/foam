#ifndef VM_INT_H
#define VM_INT_H

/*
Spec for the FOAM VM and its opcodes
====================================

Data Storage
============
The VM generally resembles a Forth system. It has two stacks, one for return
information and one for data values. The return stack consists of vm_state
records, and the data stack of void* pointer-sized values.

There is a set of opcodes for manipulating this stack of operands, and a set
for sending messages to objects.

When sending a message the arguments are in the following order, with the
stack top at the right per Forth convention: argN ... arg2 arg1 receiver

There may be 0 or more arguments; their number is arbitrary.

To distinguish easily which "code" pointers inside the VM are native code and
which are not, the least significant bit of the pointer is used. (Since code
pointers will always be word-aligned, the bottom 3 or 7 bits are unused.) The
bit is set for VM pointers and clear for code pointers.

Opcode Format
=============
Each opcode is a single 32-bit value. On 64-bit machines, this is still 32 bits.
The first 8 bits give the operation in question, and the latter 24 bits are used
for arguments. SEND is the main opcode that uses an argument.


Basic Opcodes
=============
NOP		0x00	Do nothing
RET		0x01	Returns from the current message invocation.

Stack Opcodes
=============
DROP		0x10	Discard the top value in the data stack. ( x -- )
DUP		0x11	Duplicate the top value on the data stack. ( x -- x x)
SWAP		0x12    Exchange the top two values. ( x y -- y x )
OVER		0x13    Duplicate the second-from-top value. ( y x -- y x y )
PICK n		0x14	Duplicate the nth value on the stack, counting from 0
			PICK 0 == DUP, PICK 1 == OVER.


Message-related Opcodes
=======================
SELF		0x40    Push the current receiver. ( -- self )
SEND msg	0x41	Sends the given message.
			( argN ... arg1 arg0 rcvr -- retN... ret1 ret0 )

*/

// Leave room for more pointer tags in the future, and BE SURE TO UPDATE the
// PTR_CLEAR_TAGS macro!
#define PTR_TAG_MASK_BYTECODE (1)
#define PTR_CLEAR_TAGS(p) (p & ~1)

#define OP_NOP		0x00
#define OP_RET		0x01
#define OP_DROP		0x10
#define OP_DUP		0x11
#define OP_SWAP		0x12
#define OP_OVER		0x13
#define OP_PICK		0x14
#define OP_SELF		0x40
#define OP_SEND		0x41


#define OPCODE(name) void vm_op_##name (vm_state* st, uint32_t arg)

#define OPCODE_NUMBER(opcode) ((uint32_t) ((opcode >> 24) & 0xff))
#define OPCODE_ARGUMENT(opcode) ((uint32_t) (opcode & 0x00ffffff))

#endif // VM_INT_H
