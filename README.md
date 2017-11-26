# Room-Infrastructure
## Underlying Technologies:
* Docker (Swarm && Compose)
* Node.js (ES6)
* RaspberryPi 3 (Raspbian)
* Bluetooth Low Energy
* Redis
* RedisMQ
* WeMo SmartRoom Products
* Linux (Ubuntu)

> The goal of this project is to create a message based smart room that is powered by a microservice based architecture. All microservices will be using the redisMQ library to tether all microservices processes (more information located [here](https://github.com/curiousben/redisMQ-node)). Orchestration of microservices will be based off of docker swarm then Kubernetes.

##Folder Structure:

1. infrastructure: All service initialization scripts are located here. Service orchestration will vary according to new technologies, but will take time to implement. 
2. tools: Miscellaneous shell scripts to make life easier with deployment of services and internal infrastructure will be located here.
3. microservices: Generic microservices that are used in all integrations.
4. docs: Images that is used to create the README markdown file.
5. README.md: The documentation of this repository.
  

