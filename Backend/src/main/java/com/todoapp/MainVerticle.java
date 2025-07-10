
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
            .put("password", "kingsley")
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
        router.get("/api/thmcoins").handler(this::buyTHMCoins);
        router.post("/api/bets").handler(this::createBet);
        router.post("/api/bets/:betId/accept").handler(this::acceptBet);
        router.put("/api/bets/:betId/negotiate").handler(this::negotiateBetOdds);
        router.post("/api/communities/:communityId/join").handler(this::joinCommunity);
        router.delete("/api/communities/:communityId/leave").handler(this::leaveCommunity);
        router.post("/api/events/:eventId/register").handler(this::registerToEvent);
        router.delete("/api/events/:eventId/unregister").handler(this::unregisterFromEvent);



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
            //ctx.response().setStatusCode(404).end("❌ Kein Tarif gefunden");
          ctx.response()
            .putHeader("Content-Type", "application/json")
            .setStatusCode(404)
            .end(new JsonObject().put("error", "❌ Kein Tarif gefunden").encode());

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
    if (body == null) {
      ctx.response().setStatusCode(400).end(new JsonObject().put("error", "❌ Requête invalide (pas de JSON reçu)").encode());
      return;
    }
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
    if (body == null) {
      ctx.response().setStatusCode(400).end(new JsonObject().put("error", "❌ Requête invalide (pas de JSON reçu)").encode());
      return;
    }
    //String sql = "UPDATE thm_coins_tarif SET preis_euro = ?, preis_coins = ?, gueltig_ab = ? ORDER BY id DESC LIMIT 1";
  //MariaDB / MySQL ne permet pas un ORDER BY ... LIMIT directement dans un UPDATE sans sous-requête.
    String sql ="UPDATE thm_coins_tarif SET preis_euro = ?, preis_coins = ?, gueltig_ab = ? WHERE id = (SELECT id FROM (SELECT id FROM thm_coins_tarif ORDER BY id DESC LIMIT 1) AS t)";
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

  private void buyTHMCoins(RoutingContext ctx) {
    JsonObject body = ctx.getBodyAsJson();
    int userId = body.getInteger("user_id");
    double amount = body.getDouble("amount");
    // Mise à jour du solde dans thmcoin_wallet
    String sql = "UPDATE thmcoin_wallet SET balance = balance + ? WHERE user_id = ?";
    jdbc.updateWithParams(sql, new JsonArray().add(amount).add(userId), res -> {
      if (res.succeeded()) {
        // Enregistrer la transaction dans thmcoin_transfers (from_user est NULL car achat)
        String transferSql = "INSERT INTO thmcoin_transfers (from_user, to_user, amount, description) VALUES (NULL, ?, ?, ?)";
        jdbc.updateWithParams(transferSql, new JsonArray()
          .add(userId)
          .add(amount)
          .add("Achat de " + amount + " THMCoins"), transferRes -> {
          if (transferRes.succeeded()) {
            ctx.response().setStatusCode(200).end("✅ Achat effectué.");
          } else {
            ctx.response().setStatusCode(500).end("❌ Erreur lors de l'enregistrement de la transaction.");
          }
        });
      } else {
        ctx.response().setStatusCode(500).end("❌ Erreur lors de l'achat.");
      }
    });
  }

  private void createBet(RoutingContext ctx) {
    JsonObject body = ctx.getBodyAsJson();
    int eventId = body.getInteger("event_id");
    int createdBy = body.getInteger("created_by");
    String choice = body.getString("choice");
    double stake = body.getDouble("stake");
    double odds = body.getDouble("odds");

    String sql = "INSERT INTO bets (event_id, created_by, choice, stake, odds) VALUES (?, ?, ?, ?, ?)";

    jdbc.updateWithParams(sql, new JsonArray()
      .add(eventId)
      .add(createdBy)
      .add(choice)
      .add(stake)
      .add(odds), res -> {
      if (res.succeeded()) {
        ctx.response().setStatusCode(201).end("✅ Bet créé.");
      } else {
        ctx.response().setStatusCode(500).end("❌ Erreur lors de la création du bet.");
      }
    });
  }
  private void acceptBet(RoutingContext ctx) {
    int betId = Integer.parseInt(ctx.pathParam("betId"));
    JsonObject body = ctx.getBodyAsJson();
    int acceptedBy = body.getInteger("accepted_by");
    double acceptedOdds = body.getDouble("accepted_odds");

    String sql = "INSERT INTO bet_acceptances (bet_id, accepted_by, accepted_odds) VALUES (?, ?, ?)";

    jdbc.updateWithParams(sql, new JsonArray().add(betId).add(acceptedBy).add(acceptedOdds), res -> {
      if (res.succeeded()) {
        ctx.response().setStatusCode(201).end("✅ Bet accepté.");
      } else {
        ctx.response().setStatusCode(500).end("❌ Erreur: " + res.cause().getMessage());
      }
    });
  }

  private void negotiateBetOdds(RoutingContext ctx) {
    int betId = Integer.parseInt(ctx.pathParam("betId"));
    JsonObject body = ctx.getBodyAsJson();
    double newOdds = body.getDouble("new_odds");

    String sql = "UPDATE bets SET odds = ? WHERE bet_id = ? AND status = 'OPEN'";

    jdbc.updateWithParams(sql, new JsonArray().add(newOdds).add(betId), res -> {
      if (res.succeeded() && res.result().getUpdated() > 0) {
        ctx.response().setStatusCode(200).end("✅ Gewinnquote mise à jour.");
      } else {
        ctx.response().setStatusCode(404).end("❌ Bet introuvable ou déjà accepté.");
      }
    });
  }

  private void joinCommunity(RoutingContext ctx) {
    int communityId = Integer.parseInt(ctx.pathParam("communityId"));
    JsonObject body = ctx.getBodyAsJson();
    int userId = body.getInteger("user_id");

    String sql = "INSERT INTO community_members (user_id, community_id) VALUES (?, ?)";

    jdbc.updateWithParams(sql, new JsonArray().add(userId).add(communityId), res -> {
      if (res.succeeded()) {
        ctx.response().setStatusCode(201).end("✅ Inscription à la communauté réussie.");
      } else {
        ctx.response().setStatusCode(500).end("❌ Erreur: " + res.cause().getMessage());
      }
    });
  }

  private void leaveCommunity(RoutingContext ctx) {
    int communityId = Integer.parseInt(ctx.pathParam("communityId"));
    int userId = Integer.parseInt(ctx.request().getParam("user_id"));

    String sql = "DELETE FROM community_members WHERE user_id = ? AND community_id = ?";

    jdbc.updateWithParams(sql, new JsonArray().add(userId).add(communityId), res -> {
      if (res.succeeded() && res.result().getUpdated() > 0) {
        ctx.response().setStatusCode(200).end("✅ Tu as quitté la communauté.");
      } else {
        ctx.response().setStatusCode(404).end("❌ Pas d'appartenance trouvée.");
      }
    });
  }

  private void registerToEvent(RoutingContext ctx) {
    int eventId = Integer.parseInt(ctx.pathParam("eventId"));
    JsonObject body = ctx.getBodyAsJson();
    int userId = body.getInteger("user_id");

    String sql = "INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)";

    jdbc.updateWithParams(sql, new JsonArray().add(userId).add(eventId), res -> {
      if (res.succeeded()) {
        ctx.response().setStatusCode(201).end("✅ Inscription à l'event réussie.");
      } else {
        ctx.response().setStatusCode(500).end("❌ Erreur: " + res.cause().getMessage());
      }
    });
  }

  private void unregisterFromEvent(RoutingContext ctx) {
    int eventId = Integer.parseInt(ctx.pathParam("eventId"));
    int userId = Integer.parseInt(ctx.request().getParam("user_id"));

    String sql = "DELETE FROM event_participants WHERE user_id = ? AND event_id = ?";

    jdbc.updateWithParams(sql, new JsonArray().add(userId).add(eventId), res -> {
      if (res.succeeded() && res.result().getUpdated() > 0) {
        ctx.response().setStatusCode(200).end("✅ Désinscription effectuée.");
      } else {
        ctx.response().setStatusCode(404).end("❌ Participation introuvable.");
      }
    });
  }

}
