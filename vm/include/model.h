#ifndef MODEL_H
#define MODEL_H

#include <stdint.h>
#include <array.h>

typedef uint64_t UID;

typedef struct _object {
  UID uid;
  struct _object* model_;
  array* data;
} object;

#endif // MODEL_H
