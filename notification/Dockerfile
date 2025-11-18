FROM maven:3.9.11-eclipse-temurin-17-alpine AS build

WORKDIR /app

COPY notification/pom.xml .
# Copier tout le code source
COPY notification/src ./src

# Build application
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS="-Xms256m -Xmx512m"

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT java $JAVA_OPTS -jar app.jar