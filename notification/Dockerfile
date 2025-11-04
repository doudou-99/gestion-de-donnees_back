FROM maven:3.9.11-eclipse-temurin-17-alpine AS build

WORKDIR /app

COPY pom.xml .

COPY notification/pom.xml notification/

COPY notification/src notification/

RUN mvn clean package -pl user-service -am -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS="-Xms256m -Xmx512m"

COPY --from=build /app/notification/target/notification-1.0.0.jar notification-1.0.0.jar

EXPOSE 8082

ENTRYPOINT java $JAVA_OPTS -jar notification-1.0.0.jar