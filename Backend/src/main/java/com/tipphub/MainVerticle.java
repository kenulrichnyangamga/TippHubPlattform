
package com.tipphub;

import java.util.logging.FileHandler;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import at.favre.lib.crypto.bcrypt.BCrypt;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.json.jackson.DatabindCodec;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.SQLClient;
import io.vertx.ext.sql.SQLConnection;
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
         ObjectMapper mapper = DatabindCodec.mapper();
    mapper.registerModule(new JavaTimeModule());

    ObjectMapper prettyMapper = DatabindCodec.prettyMapper();
    prettyMapper.registerModule(new JavaTimeModule());

          System.out.println("🧠 THIS IS THE RIGHT MainVerticle EXECUTED!");

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
        .allowedMethod(HttpMethod.DELETE)
        .allowedMethod(HttpMethod.PATCH)
        .allowedHeader("Content-Type"));

    // Routes principales
    router.get("/api/users").handler(this::getAllUsers);
    router.post("/api/register").handler(this::handleRegister);
    router.post("/api/login").handler(this::handleLogin);
    router.delete("/api/thmcoins/:id").handler(this::deleteTHMCoinTarif);
    router.post("/api/communities/:communityId/assign-lcb/:userId").handler(this::Lcbzuorden);
    // THMCoin routes
    router.patch("/api/pus/:userId/status").handler(this::handleUserStatusUpdate);
    router.post("/api/thmcoins").handler(this::createTHMCoinTarif);
    router.put("/api/thmcoins").handler(this::updateTHMCoinTarif);
    router.get("/api/thmcoins").handler(this::getAllTHMCoinTarifs); // ✅ ICI
    router.post("/api/community").handler(this::createCommunity);
    router.get("/api/community").handler(this::getCommunities);
    router.delete("/api/communities/:name").handler(this::deleteCommunity);
    router.get("/api/pus").handler(this::getPusList);
    router.patch("/api/pus/:id").handler(this::handlePusAction);
    router.get("/api/communities/:id").handler(this::getCommunityDetails);
    router.get("/api/communities/:id/lcb").handler(ctx -> {
    int communityId = Integer.parseInt(ctx.pathParam("id"));
    
    String sql = "SELECT u.user_id, u.username FROM users u " +
                 "JOIN community_managers cl ON u.user_id = cl.user_id " +
                 "WHERE cl.community_id = ?";
    
    jdbc.queryWithParams(sql, new JsonArray().add(communityId), res -> {
        if (res.succeeded()) {
            ctx.response()
               .putHeader("Content-Type", "application/json")
               .end(res.result().getRows().toString());
        } else {
            ctx.fail(res.cause());
        }
    });
});

    // Test route pour déboguer
    router.get("/api/ping").handler(ctx -> {
        logger.info("✅ /api/ping hit");
        ctx.response().end("pong");
    });

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
}private void getCommunityDetails(RoutingContext ctx) {
    int communityId = Integer.parseInt(ctx.pathParam("id"));
    
    String sql = "SELECT * FROM communities WHERE id = ?";
    
    jdbc.queryWithParams(sql, new JsonArray().add(communityId), res -> {
        if (res.succeeded() && !res.result().getRows().isEmpty()) {
            JsonObject community = res.result().getRows().get(0);
            ctx.response()
               .putHeader("Content-Type", "application/json")
               .end(community.encode());
        } else {
            ctx.response().setStatusCode(404).end();
        }
    });
}
private void Lcbzuorden(RoutingContext ctx) {
    int communityId = Integer.parseInt(ctx.pathParam("communityId"));
    int userId = Integer.parseInt(ctx.pathParam("userId"));

    // 1. Vérifier que l'utilisateur existe et est un PUS/KWA
    String checkSql = "SELECT user_id, role FROM users WHERE user_id = ? AND role IN ('PUS', 'KWA')";
    
    jdbc.querySingleWithParams(checkSql, new JsonArray().add(userId), checkRes -> {
        if (checkRes.failed() || checkRes.result() == null) {
            ctx.response()
               .setStatusCode(400)
               .end(new JsonObject()
                   .put("error", "User must be a PUS or KWA to become LCB")
                   .encode());
            return;
        }

        // 2. Transaction: Promouvoir en LCB + assigner à la communauté
        String promoteSql = "UPDATE users SET role = 'LCB' WHERE user_id = ?";
        String assignSql = "INSERT INTO community_managers (community_id, user_id) VALUES (?, ?)";
        
        jdbc.getConnection(connRes -> {
            if (connRes.failed()) {
                ctx.fail(connRes.cause());
                return;
            }

            SQLConnection connection = connRes.result();
            connection.setAutoCommit(false, autoCommitRes -> {
                // Étape 1: Promouvoir en LCB
                connection.updateWithParams(promoteSql, new JsonArray().add(userId), promoteRes -> {
                    if (promoteRes.failed()) {
                        rollback(connection, ctx);
                        return;
                    }

                    // Étape 2: Assigner à la communauté
                    connection.updateWithParams(assignSql, 
                        new JsonArray().add(communityId).add(userId), 
                        assignRes -> {
                            if (assignRes.failed()) {
                                rollback(connection, ctx);
                                return;
                            }

                            connection.commit(commitRes -> {
                                connection.close();
                                ctx.response()
                                   .setStatusCode(201)
                                   .end(new JsonObject()
                                       .put("message", "User successfully promoted to LCB and assigned")
                                       .encode());
                            });
                        });
                });
            });
        });
    });
}
private void handleUserStatusUpdate(RoutingContext ctx) {
    try {
        JsonObject body = ctx.getBodyAsJson();
        int userId = Integer.parseInt(ctx.pathParam("userId"));
        String newStatus = body.getString("status");

        // ⚠️ Ajoutez cette validation AVANT l'UPDATE
        System.out.println("[DEBUG] UserID: " + userId + ", NewStatus: " + newStatus);
        if (!"aktiv".equals(newStatus) && !"gesperrt".equals(newStatus)) {
            ctx.response()
               .setStatusCode(400) // Bad Request
               .putHeader("Content-Type", "text/plain")
               .end("Statut invalide. Utilisez 'aktiv' ou 'gesperrt'.");
            return; // ← Important pour stopper l'exécution
        }

        // Requête SQL (existant)
        String sql = "UPDATE users SET status = ? WHERE user_id = ?";
        jdbc.updateWithParams(sql, new JsonArray().add(newStatus).add(userId), res -> {
            if (res.succeeded()) {
                ctx.response().end("Status aktualisiert");
            } else {
                ctx.response()
                   .setStatusCode(500)
                   .end("Fehler beim Datenbank-Update: " + res.cause().getMessage());
            }
        });

    } catch (Exception e) {
        ctx.response()
           .setStatusCode(400)
           .end("Ungültige Anfrage: " + e.getMessage());
    }
}private void rollback(SQLConnection connection, RoutingContext ctx) {
    connection.rollback(rollbackRes -> {
        connection.close();
        ctx.response()
           .setStatusCode(500)
           .end(new JsonObject()
               .put("error", "Database operation failed")
               .encode());
    });
}
private void handlePusAction(RoutingContext ctx) {
    try {
        int userId = Integer.parseInt(ctx.pathParam("id"));
        JsonObject body = ctx.getBodyAsJson();
        String action = body.getString("action");

        String sql;
        switch (action) {
            case "sperren":
                sql = "UPDATE users SET status = 'gesperrt' WHERE user_id = ?";
                break;
            case "freigeben":
                sql = "UPDATE users SET status = 'aktiv' WHERE user_id = ?";
                break;
            case "lcb":
                sql = "UPDATE users SET role = 'LCB', status = 'aktiv' WHERE user_id = ?";
                break;
            default:
                ctx.response().setStatusCode(400).end();
                return;
        }
        jdbc.updateWithParams(sql, new JsonArray().add(userId), res -> {
            if (res.succeeded()) {
                ctx.response()
                   .putHeader("Content-Type", "application/json")
                   .end(new JsonObject().put("message", "success").encode());
            } else {
                ctx.fail(res.cause());
            }
        });
    } catch (Exception e) {
        ctx.fail(e);
    }
}

private void getPusList(RoutingContext ctx) {
    String sql = "SELECT user_id as id, username, role, status FROM users WHERE role IN ('PUS', 'LCB', 'KWA')";
    
    jdbc.query(sql, res -> {
        if (res.succeeded()) {
            ctx.response()
               .putHeader("Content-Type", "application/json")
               .end(res.result().getRows().toString());
        } else {
            ctx.fail(res.cause());
        }
    });
}
private void deleteCommunity(RoutingContext ctx) {
    String name = ctx.pathParam("name");
    if (name == null || name.isEmpty()) {
        ctx.response()
           .setStatusCode(400)
           .end(new JsonObject().put("error", "Community-Name erforderlich").encode());
        return;
    }

    String sql = "DELETE FROM communities WHERE name = ?";
    
    jdbc.updateWithParams(sql, new JsonArray().add(name), res -> {
        if (res.succeeded()) {
            if (res.result().getUpdated() > 0) {
                ctx.response()
                   .setStatusCode(200)
                   .end(new JsonObject().put("message", "Community gelöscht").encode());
            } else {
                ctx.response()
                   .setStatusCode(404)
                   .end(new JsonObject().put("error", "Community nicht gefunden").encode());
            }
        } else {
            logger.severe("Delete community error: " + res.cause().getMessage());
            ctx.response()
               .setStatusCode(500)
               .end(new JsonObject()
                   .put("error", "Datenbankfehler")
                   .put("details", res.cause().getMessage())
                   .encode());
        }
    });
}

private void createCommunity(RoutingContext ctx) {
    JsonObject body = ctx.getBodyAsJson();
    String name = body.getString("name");
    String region = body.getString("region");

    if (name == null || name.isEmpty()) {
        ctx.response().setStatusCode(400)
           .end(new JsonObject().put("error", "Community-Name ist erforderlich").encode());
        return;
    }

    String sql = "INSERT INTO communities (name, region) VALUES (?, ?)"; // Table 'communities' pas 'community'
    
    jdbc.updateWithParams(sql, new JsonArray().add(name).add(region != null ? region : ""), res -> {
        if (res.succeeded()) {
            ctx.response()
               .setStatusCode(201)
               .putHeader("Content-Type", "application/json")
               .end(new JsonObject().put("message", "Community erfolgreich erstellt").encode());
        } else {
            logger.severe("Fehler beim Community-Insert: " + res.cause().getMessage());
            ctx.response()
               .setStatusCode(500)
               .end(new JsonObject()
                   .put("error", "Datenbankfehler")
                   .put("details", res.cause().getMessage())
                   .encode());
        }
    });
}
private void getCommunities(RoutingContext ctx) {
    jdbc.query("SELECT * FROM communities", res -> {
        if (res.succeeded()) {
            ctx.response()
                .putHeader("Content-Type", "application/json")
                .end(res.result().getRows().toString());
        } else {
            ctx.fail(res.cause());
        }
    });
}
   private void getAllTHMCoinTarifs(RoutingContext ctx) {
    String sql = "SELECT * FROM thm_coins_tarif";

    jdbc.query(sql, res -> {
        if (res.succeeded()) {
            logger.info("✅ Tarifs chargés : " + res.result().getNumRows() + " ligne(s)");
            
            // Transforme en vrai JSON
            JsonArray result = new JsonArray(res.result().getRows());

            ctx.response()
               .putHeader("Content-Type", "application/json")
               .end(result.encode());  // ✅ encode() = vrai JSON string
        } else {
            ctx.response()
               .setStatusCode(500)
               .end("❌ Fehler: " + res.cause().getMessage());
        }
    });
}

private void deleteTHMCoinTarif(RoutingContext ctx) {
    int id = Integer.parseInt(ctx.pathParam("id"));
    String sql = "DELETE FROM thm_coins_tarif WHERE id = ?";
    
    jdbc.updateWithParams(sql, new JsonArray().add(id), res -> {
        if (res.succeeded()) {
            ctx.response().setStatusCode(200).end("✅ Tarif gelöscht");
        } else {
            ctx.response().setStatusCode(500).end("❌ Löschen fehlgeschlagen: " + res.cause().getMessage());
        }
    });
}

   private void getAllUsers(RoutingContext ctx) {
    jdbc.query("SELECT user_id, username, role FROM users", res -> {
        if (res.succeeded()) {
            JsonArray users = new JsonArray(res.result().getRows());
            ctx.response()
                .putHeader("Content-Type", "application/json")
                .end(users.encode()); // ✅ Renvoie un vrai JSON
        } else {
            ctx.response().setStatusCode(500).end("❌ Fehler beim Laden der Benutzer: " + res.cause().getMessage());
        }
    });
}


    private void handleRegister(RoutingContext ctx) {
    System.out.println("Reçu: " + ctx.getBodyAsString()); // Log la requête
    
    JsonObject body = ctx.getBodyAsJson();
    if (body == null) {
        ctx.response()
           .setStatusCode(400)
           .end("Format JSON invalide");
        return;
    }
        String username = body.getString("username");
        String email = body.getString("email");
        String password = body.getString("password");
        String role = body.getString("role", "PUS"); // default role

        String hashed = BCrypt.withDefaults().hashToString(12, password.toCharArray());

        String sql = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";

        jdbc.updateWithParams(sql, new io.vertx.core.json.JsonArray()
            .add(username).add(email).add(hashed).add(role), res -> {
            if (res.succeeded()) {
                ctx.response().setStatusCode(201).end(" User registered.");
            } else {
                ctx.response().setStatusCode(400).end(" Registration failed: " + res.cause().getMessage());
            }
        });
    }

    private void handleLogin(RoutingContext ctx) {
    JsonObject body = ctx.getBodyAsJson();
    if (body == null) {
        ctx.response().setStatusCode(400).end("Requête invalide (pas de JSON reçu)");
        return;
    }

    String email = body.getString("email");
    String password = body.getString("password");

    if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
        ctx.response().setStatusCode(400).end("Paramètres manquants");
        return;
    }

    String sql = "SELECT * FROM users WHERE email = ?";

    jdbc.queryWithParams(sql, new JsonArray().add(email), res -> {
        if (res.succeeded() && !res.result().getRows().isEmpty()) {
            JsonObject user = res.result().getRows().get(0);
            String hash = user.getString("password_hash");

            BCrypt.Result result = BCrypt.verifyer().verify(password.toCharArray(), hash);
            if (result.verified) {
                JsonObject response = new JsonObject()
                    .put("user_id", user.getInteger("user_id"))
                    .put("username", user.getString("username"))
                    .put("role", user.getString("role"))
                    .put("message", "Login successful");

                ctx.response()
                   .setStatusCode(200)
                   .putHeader("Content-Type", "application/json")
                   .end(response.encode());
            } else {
                ctx.response().setStatusCode(401).end("Identifiants invalides");
            }
        } else {
            ctx.response().setStatusCode(401).end("Utilisateur introuvable");
        }
    });
}

private void createTHMCoinTarif(RoutingContext ctx) {
    JsonObject body = ctx.getBodyAsJson();
    logger.info("📥 JSON reçu : " + body.encodePrettily());

    String sql = "INSERT INTO thm_coins_tarif (preis_euro, preis_coins, gueltig_ab) VALUES (?, ?, ?)";

    jdbc.getConnection(connHandler -> {
        if (connHandler.succeeded()) {
            SQLConnection connection = connHandler.result();

            // Active l'autocommit
            connection.setAutoCommit(true, ar -> {
                if (ar.succeeded()) {
                    connection.updateWithParams(sql, new JsonArray()
                        .add(body.getDouble("preis_euro"))
                        .add(body.getInteger("preis_coins"))
                        .add(body.getString("gueltig_ab")), res -> {

                        if (res.succeeded()) {
                            logger.info("✅ THMCoin Tarif inséré !");
                            ctx.response().setStatusCode(201).end("✅ THMCoin Tarif erstellt.");
                        } else {
                            logger.severe("❌ Erreur SQL INSERT : " + res.cause().getMessage());
                            ctx.response().setStatusCode(500).end("❌ Fehler: " + res.cause().getMessage());
                        }
                        connection.close(); // Toujours fermer la connexion
                    });
                } else {
                    logger.severe("❌ Impossible d'activer autocommit : " + ar.cause().getMessage());
                    ctx.response().setStatusCode(500).end("❌ Autocommit-Fehler");
                    connection.close();
                }
            });

        } else {
            logger.severe("❌ Connexion DB échouée : " + connHandler.cause().getMessage());
            ctx.response().setStatusCode(500).end("❌ Fehler bei der DB-Verbindung");
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
