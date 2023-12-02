import socket as s
from os import *
host = input("enter site : ")
host2= s.gethostbyname(host)

os.system(f"ping {host2} -t -l 1000" ))