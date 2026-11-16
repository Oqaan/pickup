# Build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN useradd --system --no-create-home pickup
USER pickup
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
# Small start heap and the light JIT cut idle memory by about a third
ENTRYPOINT ["java", "-Xms32m", "-Xmx128m", "-Xss512k", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1", "-jar", "app.jar"]