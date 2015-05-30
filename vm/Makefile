CFLAGS=-g -Iinclude -Imap/include

default: vm.o

%.o: %.c include/*
	gcc $(CFLAGS) -o $@ -c $<

clean:
	rm -rf *.o vm
