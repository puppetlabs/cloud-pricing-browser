FROM alpine:latest

ADD ./web /web
ADD ./public /public/

ENTRYPOINT ["./web"]
