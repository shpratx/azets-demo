# AP-10.9: non-root, read-only-friendly runtime image with a pinned base.
FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S alm && adduser -S alm -G alm
WORKDIR /app
COPY target/alm-mapping-service-*.jar app.jar
USER alm
EXPOSE 8082
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget -qO- http://localhost:8082/actuator/health/liveness || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
