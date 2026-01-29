FROM ubuntu:latest
LABEL authors="konstantinvakhrushev"

ENTRYPOINT ["top", "-b"]
