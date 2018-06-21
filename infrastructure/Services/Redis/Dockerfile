FROM redis:4.0.10
COPY redis.conf /usr/local/etc/redis/redis.conf
RUN apt-get update && apt-get install vim \
  netcat

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
#docker run -d --name redis --sysctl net.core.somaxconn=65535 redis-custom
