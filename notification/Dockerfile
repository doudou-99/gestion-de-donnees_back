FROM maven:3.9.11-eclipse-temurin-17-alpine AS build

WORKDIR /app

COPY pom.xml .
# Copier tout le code source
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS="-Xms256m -Xmx512m"

RUN ls -R /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT java $JAVA_OPTS -jar app.jar