CFLAGS=-g -Iinclude -std=gnu99

default: vm.o

%.o: %.c include/*
	gcc $(CFLAGS) -o $@ -c $<

clean:
	rm -rf *.o vm
