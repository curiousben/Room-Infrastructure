# Disabling Transparent Huge Pages(THP) in the docker container

## Set docker container is privileged mode
Example:
`$ docker run -d --name redis --privileged -p 6379:6379 -v <Path/to/config/on host>:<Path/to/config/in/container> <redisimage>`

Bash in:
`$ docker exec -it <container> bash`
`echo never | tee /sys/kernel/mm/transparent_hugepage/enabled`
`echo never | tee /sys/kernel/mm/transparent_hugepage/defrag`
