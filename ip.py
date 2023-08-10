import socket
host = input("enter site : ")
host2= socket.gethostbyname(host)
print (host2)