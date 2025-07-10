
package com.todoapp;

import java.util.logging.FileHandler;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

import at.favre.lib.crypto.bcrypt.BCrypt;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.SQLClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;

public class MainVerticle extends AbstractVerticle {

    private SQLClient jdbc;
    private static final Logger logger = Logger.getLogger(MainVerticle.class.getName());
    
    public static void main(String[] args) {
    io.vertx.core.Vertx vertx = io.vertx.core.Vertx.vertx();
    vertx.deployVerticle(new MainVerticle());
    }


    @Override
    public void start(Promise<Void> startPromise) {

        try {
            FileHandler fh = new FileHandler("logs/server.log", true);
            fh.setFormatter(new SimpleFormatter());
            logger.addHandler(fh);
            logger.setLevel(Level.ALL);
            logger.setUseParentHandlers(true);
        } catch (Exception e) {
            e.printStackTrace();
        }

        JsonObject config = new JsonObject()
            .put("url", "jdbc:mariadb://localhost:3300/tipphub")
            .put("driver_class", "org.mariadb.jdbc.Driver")
            .put("user", "root")
            .put("password", "fragile")
            .put("max_pool_size", 50)
            .put("testConnectionOnCheckin", true );

        jdbc = JDBCClient.createShared(vertx, config);

        jdbc.getConnection(conn -> {
            if (conn.succeeded()) {
                logger.info("✅ Connected to TippHub database.");
                setupRoutes(startPromise);
            } else {
                logger.severe("❌ Database connection failed: " + conn.cause().getMessage());
                startPromise.fail(conn.cause());
            }
        });
    }

    private void setupRoutes(Promise<Void> startPromise) {
        Router router = Router.router(vertx);

        router.route().handler(BodyHandler.create());
        router.route().handler(CorsHandler.create("*")
                .allowedMethod(HttpMethod.POST)
                .allowedMethod(HttpMethod.GET)
                .allowedMethod(HttpMethod.PUT)
                .allowedHeader("Content-Type"));

        router.get("/api/users").handler(this::getAllUsers);
        router.post("/api/register").handler(this::handleRegister);
        router.post("/api/login").handler(this::handleLogin);
        router.post("/api/thmcoins").handler(this::createTHMCoinTarif);
        router.put("/api/thmcoins").handler(this::updateTHMCoinTarif);
        router.get("/api/thmcoins").handler(this::getCurrentTHMCoinTarif);

        vertx.createHttpServer()
            .requestHandler(router)
            .listen(8888, res -> {
                if (res.succeeded()) {
                    logger.info("🚀 TippHub backend running on port 8888");
                    startPromise.complete();
                } else {
                    logger.severe("❌ Server failed to start: " + res.cause());
                    startPromise.fail(res.cause());
                }
            });
    }
    private void getCurrentTHMCoinTarif(RoutingContext ctx) {
    String sql = "SELECT * FROM thm_coins_tarif ORDER BY gueltig_ab DESC LIMIT 1";

    jdbc.query(sql, res -> {
        if (res.succeeded() && !res.result().getRows().isEmpty()) {
            JsonObject tarif = res.result().getRows().get(0);
            ctx.response()
               .putHeader("Content-Type", "application/json")
               .end(tarif.encode());
        } else {
            ctx.response().setStatusCode(404).end("❌ Kein Tarif gefunden");
        }
    });
}


    private void getAllUsers(RoutingContext ctx) {
        jdbc.query("SELECT user_id, username, role FROM users", res -> {
            if (res.succeeded()) {
                ctx.response()
                    .putHeader("Content-Type", "application/json")
                    .end(res.result().getRows().toString());
            } else {
                ctx.fail(res.cause());
            }
        });
    }

    private void handleRegister(RoutingContext ctx) {
        JsonObject body = ctx.getBodyAsJson();
        String username = body.getString("username");
        String email = body.getString("email");
        String password = body.getString("password");
        String role = body.getString("role", "PUS"); // default role

        String hashed = BCrypt.withDefaults().hashToString(12, password.toCharArray());

        String sql = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";

        jdbc.updateWithParams(sql, new io.vertx.core.json.JsonArray()
            .add(username).add(email).add(hashed).add(role), res -> {
            if (res.succeeded()) {
                ctx.response().setStatusCode(201).end("✅ User registered.");
            } else {
                ctx.response().setStatusCode(400).end("❌ Registration failed: " + res.cause().getMessage());
            }
        });
    }

    private void handleLogin(RoutingContext ctx) {
    JsonObject body = ctx.getBodyAsJson();
    if (body == null) {
        ctx.response().setStatusCode(400).end("❌ Requête invalide (pas de JSON reçu)");
        return;
    }

    String identifier = body.getString("username"); // peut être username ou email
    String password = body.getString("password");

    if (identifier == null || password == null || identifier.isEmpty() || password.isEmpty()) {
        ctx.response().setStatusCode(400).end("❌ Paramètres manquants");
        return;
    }

    String sql = "SELECT * FROM users WHERE username = ? OR email = ?";

    jdbc.queryWithParams(sql, new JsonArray().add(identifier).add(identifier), res -> {
        if (res.succeeded() && !res.result().getRows().isEmpty()) {
            JsonObject user = res.result().getRows().get(0);
            String hash = user.getString("password_hash");

            BCrypt.Result result = BCrypt.verifyer().verify(password.toCharArray(), hash);
            if (result.verified) {
                ctx.response().setStatusCode(200)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject()
                        .put("user_id", user.getInteger("user_id"))
                        .put("username", user.getString("username"))
                        .put("role", user.getString("role"))
                        .put("message", "✅ Login successful").encode());
            } else {
                ctx.response().setStatusCode(401).end("❌ Invalid credentials");
            }
        } else {
            ctx.response().setStatusCode(401).end("❌ User not found");
        }
    }
    );
}
private void createTHMCoinTarif(RoutingContext ctx) {
    JsonObject body = ctx.getBodyAsJson();
    String sql = "INSERT INTO thm_coins_tarif (preis_euro, preis_coins, gueltig_ab) VALUES (?, ?, ?)";

    jdbc.updateWithParams(sql, new JsonArray()
        .add(body.getDouble("preis_euro"))
        .add(body.getInteger("preis_coins"))
        .add(body.getString("gueltig_ab")), res -> {

        if (res.succeeded()) {
            ctx.response().setStatusCode(201).end("✅ THMCoin Tarif erstellt.");
        } else {
            ctx.response().setStatusCode(500).end("❌ Fehler: " + res.cause().getMessage());
        }
    });
}
private void updateTHMCoinTarif(RoutingContext ctx) {
    JsonObject body = ctx.getBodyAsJson();
    String sql = "UPDATE thm_coins_tarif SET preis_euro = ?, preis_coins = ?, gueltig_ab = ? ORDER BY id DESC LIMIT 1";

    jdbc.updateWithParams(sql, new JsonArray()
        .add(body.getDouble("preis_euro"))
        .add(body.getInteger("preis_coins"))
        .add(body.getString("gueltig_ab")), res -> {

        if (res.succeeded()) {
            ctx.response().setStatusCode(200).end("✅ THMCoin Tarif aktualisiert.");
        } else {
            ctx.response().setStatusCode(500).end("❌ Fehler: " + res.cause().getMessage());
        }
    });
}

}
